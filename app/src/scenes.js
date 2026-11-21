// Built-in sample "photos": original scenes drawn procedurally on a canvas —
// a Vice City-style sunset sky, a striped sun, a neon skyline, palm silhouettes
// and one stylised person silhouette standing on the boulevard. Nothing here is
// copied from any game: every shape is drawn from numbers in this file.

export const SCENE_NAMES = ['boulevard', 'pier', 'beach'];

/** The palette of one scene: sky stops, sun colour, city lights, ground. */
const PALETTES = {
  boulevard: {
    sky: ['#2b1055', '#7597de', '#ff7e5f', '#feb47b'],
    sun: '#ffd166', sunRing: '#ff5e78',
    city: '#1a0f2e', windows: '#ffd166',
    ground: '#160b26', neonA: '#ff2e88', neonB: '#19e3c2',
  },
  pier: {
    sky: ['#0b1035', '#3b2d8f', '#ff2e88', '#ff9a5c'],
    sun: '#ff5e78', sunRing: '#19e3c2',
    city: '#0d0a24', windows: '#19e3c2',
    ground: '#0a0618', neonA: '#19e3c2', neonB: '#ff2e88',
  },
  beach: {
    sky: ['#3b1d5e', '#c94b7c', '#ff8c42', '#ffd166'],
    sun: '#fff3b0', sunRing: '#ff7ad9',
    city: '#241040', windows: '#ff7ad9',
    ground: '#1c0d33', neonA: '#ff7ad9', neonB: '#ffb02e',
  },
};

/** A deterministic pseudo-random number from a seed, so a scene is stable. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Draws a striped retro sun: a disc with horizontal slices cut out of its lower half. */
function drawStripedSun(ctx, cx, cy, r, colour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.08;
  let h = r * 0.05;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, h);
    y += h * 2.6;
    h *= 1.35;
  }
  ctx.restore();
}

/** A row of tower blocks with lit windows, plus a couple of rooftop antennas. */
function drawSkyline(ctx, w, horizon, palette, rand) {
  ctx.fillStyle = palette.city;
  let x = -w * 0.02;
  while (x < w * 1.02) {
    const bw = w * (0.06 + rand() * 0.09);
    const bh = horizon * (0.25 + rand() * 0.55);
    ctx.fillRect(x, horizon - bh, bw, bh);
    if (rand() > 0.6) {
      ctx.fillRect(x + bw * 0.45, horizon - bh - bh * 0.18, 3, bh * 0.18);
      ctx.fillStyle = palette.neonA;
      ctx.beginPath();
      ctx.arc(x + bw * 0.45 + 1.5, horizon - bh - bh * 0.18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.city;
    }
    ctx.fillStyle = palette.windows;
    const cols = Math.max(2, Math.floor(bw / 16));
    const rows = Math.max(2, Math.floor(bh / 22));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > 0.55) ctx.fillRect(x + 5 + c * 16, horizon - bh + 8 + r * 22, 7, 10);
      }
    }
    ctx.fillStyle = palette.city;
    x += bw + w * 0.012;
  }
}

/** A palm tree: curved trunk and seven drooping fronds. */
function drawPalm(ctx, x, baseY, h, lean, colour) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(4, h * 0.035);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * 0.4, baseY - h * 0.6, x + lean, baseY - h);
  ctx.stroke();
  const topX = x + lean;
  const topY = baseY - h;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.95) + (i * Math.PI * 0.95) / 6;
    const len = h * (0.42 + (i % 3) * 0.06);
    ctx.lineWidth = Math.max(3, h * 0.02);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.5 - h * 0.12,
      topX + Math.cos(a) * len, topY + Math.sin(a) * len + h * 0.18,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A stylised person silhouette: head, neck, shoulders, jacket and legs, standing
 * centre-frame with both arms relaxed at the sides — a poster figure, drawn,
 * not a photograph of anyone.
 */
function drawFigure(ctx, cx, baseY, h, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  const headR = h * 0.068;
  const headY = baseY - h * 0.92;
  // Head and hair sweep.
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - headR * 0.15, headY - headR * 0.3, headR * 0.9, Math.PI * 0.85, Math.PI * 2.05);
  ctx.fill();
  // Neck.
  ctx.fillRect(cx - headR * 0.35, headY + headR * 0.7, headR * 0.7, h * 0.06);
  // Torso / jacket: wide shoulders tapering to the waist.
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.115, baseY - h * 0.80);
  ctx.quadraticCurveTo(cx - h * 0.15, baseY - h * 0.52, cx - h * 0.115, baseY - h * 0.30);
  ctx.lineTo(cx + h * 0.115, baseY - h * 0.30);
  ctx.quadraticCurveTo(cx + h * 0.15, baseY - h * 0.52, cx + h * 0.115, baseY - h * 0.80);
  ctx.quadraticCurveTo(cx, baseY - h * 0.85, cx - h * 0.115, baseY - h * 0.80);
  ctx.fill();
  // Arms hanging at the sides, slightly out from the body.
  ctx.lineWidth = h * 0.042;
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.125, baseY - h * 0.72);
  ctx.lineTo(cx - h * 0.185, baseY - h * 0.34);
  ctx.moveTo(cx + h * 0.125, baseY - h * 0.72);
  ctx.lineTo(cx + h * 0.185, baseY - h * 0.34);
  ctx.stroke();
  // Legs.
  ctx.lineWidth = h * 0.055;
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.05, baseY - h * 0.30);
  ctx.lineTo(cx - h * 0.075, baseY);
  ctx.moveTo(cx + h * 0.05, baseY - h * 0.30);
  ctx.lineTo(cx + h * 0.075, baseY);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws one sample scene onto `canvas` (any size) and returns the canvas, so
 * it can be used as the cover's photo. `scene` is one of SCENE_NAMES.
 */
export function makeSamplePhoto(scene, canvas) {
  const name = SCENE_NAMES.includes(scene) ? scene : 'boulevard';
  const palette = PALETTES[name];
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const rand = rng(name.length * 7919 + 13);

  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
  palette.sky.forEach((c, i) => sky.addColorStop(i / (palette.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.72);

  // Sun glow and striped sun.
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, w * 0.42);
  glow.addColorStop(0, palette.sun);
  glow.addColorStop(1, 'rgba(255, 94, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.72);
  drawStripedSun(ctx, w * 0.5, h * 0.42, w * 0.17, palette.sun);
  ctx.strokeStyle = palette.sunRing;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.42, w * 0.17 + 10, 0, Math.PI * 2);
  ctx.stroke();

  // Stars in the upper sky.
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(rand() * w, rand() * h * 0.22, 2, 2);
  }

  const horizon = h * 0.72;
  drawSkyline(ctx, w, horizon, palette, rand);

  // Ground: wet boulevard reflecting the sunset.
  const ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, palette.ground);
  ground.addColorStop(1, '#05030c');
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = palette.neonA;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, horizon, w, 3);
  ctx.globalAlpha = 1;

  // Neon reflections.
  for (let i = 0; i < 9; i++) {
    const x = rand() * w;
    ctx.fillStyle = i % 2 ? palette.neonA : palette.neonB;
    ctx.globalAlpha = 0.25 + rand() * 0.3;
    ctx.fillRect(x, horizon + 6, 4 + rand() * 10, (h - horizon) * (0.3 + rand() * 0.6));
  }
  ctx.globalAlpha = 1;

  // Palms left and right, figure centre.
  drawPalm(ctx, w * 0.07, h * 0.99, h * 0.42, w * 0.05, '#0a0616');
  drawPalm(ctx, w * 0.94, h * 0.99, h * 0.36, -w * 0.05, '#0a0616');
  drawFigure(ctx, w * 0.5, h * 0.97, h * 0.62, '#0a0616');
  return canvas;
}
