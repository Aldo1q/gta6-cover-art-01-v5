// Fixed scenes for screenshots: ?shot=cover shows one finished cover alone,
// ?shot=editor shows the editor with a photo loaded and a caption being typed.
// `layout`, `photo` (a built-in scene), `caption`, `subcaption` and `grade`
// come from the query; window.__shotReady is set once the cover is painted.
export async function runShot(shot, query, api) {
  const { state, caption, subcaption, useScene, redraw, fontsReady } = api;
  const layout = query.get('layout') ?? 'grid';
  state.layout = layout;
  state.grade = query.get('grade') ?? 'sunset';
  state.caption = query.get('caption') ?? 'Neon Coast';
  state.subcaption = query.get('subcaption') ?? 'Chase the sunset. Own the night.';
  caption.value = state.caption;
  subcaption.value = state.subcaption;

  const canvas = document.getElementById('cover');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const w = Number(query.get('w') ?? 1080);
    const h = Number(query.get('h') ?? 1080);
    canvas.width = w;
    canvas.height = h;
  } else if (shot === 'editor') {
    document.body.classList.add('shot-editor');
  }
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === layout);
  });
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });

  await fontsReady();
  useScene(query.get('photo') ?? 'boulevard');
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
