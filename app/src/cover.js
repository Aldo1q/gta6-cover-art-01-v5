// Draws the cover: three GTA-poster layouts, a colour grade, and bold display
// lettering (Anton for the headline, Pacifico for the tagline — both shipped
// under app/fonts/ under the SIL Open Font License). Everything is drawn on a
// canvas, so any size exports pixel-identical to the live preview.

/** Colour grades: tint washes and accent colours for the lettering. */
export const GRADES = {
  sunset: {
    tintTop: 'rgba(255, 126, 95, 0.10)',
    tintBottom: 'rgba(255, 46, 136, 0.42)',
    band: '#1a0f2e',
    headline: '#ffffff',
    headlineStroke: '#ff2e88',
    tagline: '#ffd166',
    badge: '#ffb02e',
  },
  neon: {
    tintTop: 'rgba(25, 227, 194, 0.12)',
    tintBottom: 'rgba(123, 47, 247, 0.45)',
    band: '#0d0a24',
    headline: '#ffffff',
    headlineStroke: '#19e3c2',
    tagline: '#19e3c2',
    badge: '#19e3c2',
  },
  vice: {
    tintTop: 'rgba(255, 122, 217, 0.14)',
    tintBottom: 'rgba(255, 46, 136, 0.40)',
    band: '#2b0f2e',
    headline: '#fff3f8',
    headlineStroke: '#ff7ad9',
    tagline: '#7df9e2',
    badge: '#ff7ad9',
  },
};

export const LAYOUTS = ['grid', 'snapshots', 'fullbleed'];
export const EXPORT_SIZES = [
  { label: '1080 × 1080', w: 1080, h: 1080 },
  { label: '1080 × 1350', w: 1080, h: 1350 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
];

/**
 * Draws `photo` (an image or canvas, or null) into a rectangle, cover-fit,
 * with the user's zoom and pan. `crop` picks which slice of the photo the
 * panel shows (0..1 across each axis) — in the grid each panel gets its own
 * slice of the same photo.
 */
export function drawPhotoInto(ctx, photo, x, y, w, h, state, crop) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#3b2d6e');
    g.addColorStop(1, '#160b26');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    return;
  }
  const pw = photo.naturalWidth || photo.width;
  const ph = photo.naturalHeight || photo.height;
  const zoom = (state.zoom ?? 130) / 100;
  const base = Math.max(w / pw, h / ph) * zoom;
  const dw = pw * base;
  const dh = ph * base;
  const cx = crop ? crop.x : 0.5;
  const cy = crop ? crop.y : 0.5;
  const panX = (state.panX ?? 0) / 100;
  const panY = (state.panY ?? 0) / 100;
  const dx = x + (w - dw) * cx + panX * w * 0.2;
  const dy = y + (h - dh) * cy + panY * h * 0.2;
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.restore();
}

/** A colour-grade wash over a rectangle. */
export function gradeWash(ctx, x, y, w, h, grade) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, grade.tintTop);
  g.addColorStop(1, grade.tintBottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Shrinks `size` until `text` fits `maxWidth`, then returns the font string. */
export function fitFont(ctx, text, family, size, maxWidth, weight = 400) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > 10) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/** Headline in Anton capitals with a coloured outline and a soft shadow. */
export function drawHeadline(ctx, text, cx, y, maxWidth, size, grade) {
  const clean = text.trim().toUpperCase();
  if (!clean) return;
  const s = fitFont(ctx, clean, 'Anton, sans-serif', size, maxWidth);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = s * 0.18;
  ctx.shadowOffsetY = s * 0.05;
  ctx.strokeStyle = grade.headlineStroke;
  ctx.lineWidth = Math.max(2, s * 0.07);
  ctx.strokeText(clean, cx, y);
  ctx.fillStyle = grade.headline;
  ctx.fillText(clean, cx, y);
  ctx.restore();
}

/** Tagline in Pacifico script, centred. */
export function drawTagline(ctx, text, cx, y, maxWidth, size, grade) {
  const clean = text.trim();
  if (!clean) return;
  const s = fitFont(ctx, clean, 'Pacifico, cursive', size, maxWidth);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = s * 0.2;
  ctx.fillStyle = grade.tagline;
  ctx.fillText(clean, cx, y);
  ctx.restore();
}

/** The 8 panel crops of the grid: a 2×4 walk across the photo. */
export function gridCrops() {
  const crops = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      crops.push({ x: col === 0 ? 0.28 : 0.72, y: 0.18 + row * 0.2 });
    }
  }
  return crops;
}

/** Layout 1 — Cover Grid: 8 panels of the same photo, headline band below. */
export function drawGridCover(ctx, w, h, state, grade) {
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, 0, w, h);
  const gap = Math.round(w * 0.012);
  const top = Math.round(h * 0.045);
  const bandH = Math.round(h * 0.185);
  const gridH = h - top - bandH - gap;
  const panelW = (w - gap * 3) / 2;
  const panelH = (gridH - gap * 3) / 4;
  const crops = gridCrops();
  for (let i = 0; i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = gap + col * (panelW + gap);
    const y = top + row * (panelH + gap);
    drawPhotoInto(ctx, state.photo, x, y, panelW, panelH, state, crops[i]);
    gradeWash(ctx, x, y, panelW, panelH, grade);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(x, y, panelW, panelH);
  }
  // Headline band.
  const bandY = top + gridH + gap;
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = grade.headlineStroke;
  ctx.fillRect(0, bandY, w, Math.max(3, h * 0.004));
  drawHeadline(ctx, state.caption, w / 2, bandY + bandH * 0.52, w * 0.92, h * 0.075, grade);
  drawTagline(ctx, state.subcaption, w / 2, bandY + bandH * 0.86, w * 0.9, h * 0.028, grade);
  // Kicker above the grid.
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = `400 ${Math.round(h * 0.02)}px Anton, sans-serif`;
  ctx.fillStyle = grade.badge;
  ctx.fillText('N E O N   C O A S T', gap, top - h * 0.012);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('VICE CITY · 2026', w - gap, top - h * 0.012);
  ctx.restore();
}

/** Layout 2 — Snapshots: three tilted polaroids over a graded skyline. */
export function drawSnapshotsCover(ctx, w, h, state, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.55, '#c94b7c');
  sky.addColorStop(1, '#ff8c42');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  drawHeadline(ctx, state.caption, w / 2, h * 0.13, w * 0.92, h * 0.085, grade);
  drawTagline(ctx, state.subcaption, w / 2, h * 0.185, w * 0.9, h * 0.03, grade);

  const pw = w * 0.52;
  const ph = pw * 0.78;
  const spots = [
    { x: w * 0.10, y: h * 0.26, rot: -0.10, crop: { x: 0.3, y: 0.3 }, front: false },
    { x: w * 0.38, y: h * 0.30, rot: 0.06, crop: { x: 0.65, y: 0.45 }, front: false },
    { x: w * 0.22, y: h * 0.52, rot: -0.03, crop: { x: 0.5, y: 0.65 }, front: true },
  ];
  for (const spot of spots) {
    ctx.save();
    ctx.translate(spot.x + pw / 2, spot.y + ph / 2);
    ctx.rotate(spot.rot);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fdf8ef';
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph + ph * 0.16);
    ctx.shadowColor = 'transparent';
    const imgH = ph * 0.82;
    drawPhotoInto(ctx, state.photo, -pw / 2 + pw * 0.04, -ph / 2 + ph * 0.04, pw * 0.92, imgH, state, spot.crop);
    gradeWash(ctx, -pw / 2 + pw * 0.04, -ph / 2 + ph * 0.04, pw * 0.92, imgH, grade);
    // Only the front print carries the tagline — the stack would clip it on the others.
    if (spot.front) {
      ctx.fillStyle = '#2b1b3d';
      ctx.font = `${Math.round(ph * 0.075)}px Pacifico, cursive`;
      ctx.textAlign = 'center';
      ctx.fillText(state.subcaption.trim() || 'Neon Coast', 0, ph / 2 + ph * 0.10);
    }
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `400 ${Math.round(h * 0.02)}px Anton, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('N E O N   C O A S T', w / 2, h * 0.965);
  ctx.restore();
}

/** Layout 3 — Full Bleed: one hero photo, headline low over the grade. */
export function drawFullBleedCover(ctx, w, h, state, grade) {
  drawPhotoInto(ctx, state.photo, 0, 0, w, h, state, { x: 0.5, y: 0.42 });
  const wash = ctx.createLinearGradient(0, h * 0.3, 0, h);
  wash.addColorStop(0, grade.tintTop);
  wash.addColorStop(1, grade.tintBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(10, 6, 22, 0.35)';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = `400 ${Math.round(h * 0.022)}px Anton, sans-serif`;
  ctx.fillStyle = grade.badge;
  ctx.fillText('N E O N   C O A S T', w * 0.05, h * 0.06);
  ctx.restore();
  // Headline, left-aligned and low over the grade.
  ctx.save();
  ctx.textAlign = 'left';
  const clean = state.caption.trim().toUpperCase();
  if (clean) {
    const s = fitFont(ctx, clean, 'Anton, sans-serif', h * 0.11, w * 0.9);
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = s * 0.18;
    ctx.shadowOffsetY = s * 0.05;
    ctx.strokeStyle = grade.headlineStroke;
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.strokeText(clean, w * 0.05, h * 0.93);
    ctx.fillStyle = grade.headline;
    ctx.fillText(clean, w * 0.05, h * 0.93);
  }
  ctx.restore();
  ctx.save();
  ctx.textAlign = 'left';
  const tag = state.subcaption.trim();
  if (tag) {
    fitFont(ctx, tag, 'Pacifico, cursive', h * 0.032, w * 0.85);
    ctx.fillStyle = grade.tagline;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText(tag, w * 0.05, h * 0.975);
  }
  ctx.restore();
}

/** Draws the whole cover for `state` onto `canvas` at its own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  ctx.clearRect(0, 0, w, h);
  if (state.layout === 'snapshots') drawSnapshotsCover(ctx, w, h, state, grade);
  else if (state.layout === 'fullbleed') drawFullBleedCover(ctx, w, h, state, grade);
  else drawGridCover(ctx, w, h, state, grade);
}

/** Renders the cover at an export size and returns the fresh canvas. */
export function renderCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
