// Wires the studio: layout, photo (upload or built-in scene), crop sliders,
// caption, grade and the three PNG exports. The preview canvas redraws live on
// every change. A `?shot=` query sets up a fixed scene for a screenshot
// instead (see ./shots.js).
import { drawCover, renderCover } from './cover.js';
import { makeSamplePhoto } from './scenes.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const caption = document.getElementById('caption');
const subcaption = document.getElementById('subcaption');
const status = document.getElementById('status');
const sizeLabel = document.getElementById('sizeLabel');

export const state = {
  layout: 'grid',
  photo: null,
  caption: 'Neon Coast',
  subcaption: 'Chase the sunset. Own the night.',
  grade: 'sunset',
  zoom: 130,
  panX: 0,
  panY: 0,
  panel: 0,
};

/** Waits until the shipped display fonts are usable on canvas. */
export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px Pacifico'),
    ]);
    await document.fonts.ready;
  } catch {
    // Fall back to system fonts; the cover still draws.
  }
}

export function redraw() {
  state.caption = caption.value;
  state.subcaption = subcaption.value;
  drawCover(canvas, state);
  sizeLabel.textContent = `${canvas.width} × ${canvas.height} preview`;
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Builds a procedural sample scene and uses it as the photo. */
export function useScene(name) {
  const scene = document.createElement('canvas');
  scene.width = 1200;
  scene.height = 1500;
  makeSamplePhoto(name, scene);
  state.photo = scene;
  redraw();
  status.textContent = `Sample scene loaded — ${name}. Upload your own photo any time.`;
}

/** Renders the cover at a size and downloads it as a PNG. */
export function exportCover(sizeName) {
  const [w, h] = sizeName.split('x').map(Number);
  const out = renderCover(state, w, h);
  out.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-coast-${state.layout}-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved neon-coast-${state.layout}-${w}x${h}.png`;
  }, 'image/png');
}

function bindButtons(selector, onPick) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      onPick(button);
    });
  });
}

bindButtons('[data-layout]', (button) => {
  state.layout = button.dataset.layout;
  const square = state.layout === 'grid' || state.layout === 'snapshots';
  canvas.width = square ? 1080 : 1920;
  canvas.height = square ? 1080 : 1080;
  redraw();
  status.textContent = `Layout: ${button.textContent}.`;
});
bindButtons('[data-scene]', (button) => useScene(button.dataset.scene));
bindButtons('[data-grade]', (button) => {
  state.grade = button.dataset.grade;
  redraw();
  status.textContent = `Grade: ${button.textContent.trim()}.`;
});
bindButtons('[data-panel]', (button) => {
  state.panel = Number(button.dataset.panel);
  redraw();
  status.textContent = `Previewing panel ${state.panel + 1} of 8 — same photo, its own crop.`;
});
document.querySelectorAll('[data-export]').forEach((button) => {
  button.addEventListener('click', () => exportCover(button.dataset.export));
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photo = await loadImage(URL.createObjectURL(file));
  redraw();
  status.textContent = `Photo loaded — ${file.name}.`;
});

function bindSlider(id, outId, key, suffix) {
  const input = document.getElementById(id);
  const out = document.getElementById(outId);
  input.addEventListener('input', () => {
    state[key] = Number(input.value);
    out.textContent = `${input.value}${suffix}`;
    redraw();
  });
}
bindSlider('zoom', 'zoomOut', 'zoom', '%');
bindSlider('panX', 'panXOut', 'panX', '');
bindSlider('panY', 'panYOut', 'panY', '');

caption.addEventListener('input', redraw);
subcaption.addEventListener('input', redraw);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, { state, caption, subcaption, useScene, redraw, fontsReady });
} else {
  fontsReady().then(() => {
    useScene('boulevard');
  });
}
