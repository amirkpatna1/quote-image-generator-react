export const FILTER_PRESETS = [
  { id: 'none',      label: 'Original',   icon: '○',  filter: 'none' },
  { id: 'grayscale', label: 'Grayscale',  icon: '⬜', filter: 'grayscale(100%) contrast(1.1)' },
  { id: 'sepia',     label: 'Sepia',      icon: '🟫', filter: 'sepia(75%) contrast(1.08) brightness(1.05)' },
  { id: 'warm',      label: 'Warm',       icon: '🟠', filter: 'saturate(1.35) hue-rotate(-18deg) brightness(1.06)' },
  { id: 'cool',      label: 'Cool',       icon: '🔵', filter: 'saturate(0.85) hue-rotate(28deg) brightness(1.04)' },
  { id: 'dramatic',  label: 'Dramatic',   icon: '🎭', filter: 'contrast(1.35) brightness(0.88) saturate(1.25)' },
  { id: 'fade',      label: 'Fade',       icon: '🌫️',  filter: 'contrast(0.82) brightness(1.12) saturate(0.75)' },
  { id: 'noir',      label: 'Noir',       icon: '⬛', filter: 'grayscale(100%) contrast(1.4) brightness(0.85)' },
];

/**
 * Applies a CSS filter to an entire canvas by rendering it through a temp canvas.
 * Called after all content has been drawn.
 */
export function applyCanvasFilter(canvas, filterString) {
  if (!filterString || filterString === 'none') return;
  const W = canvas.width, H = canvas.height;
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  const tctx = tmp.getContext('2d');
  tctx.filter = filterString;
  tctx.drawImage(canvas, 0, 0);
  tctx.filter = 'none';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(tmp, 0, 0);
}
