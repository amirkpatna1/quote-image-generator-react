export function getCanvasSize(size) {
  if (typeof size === 'object' && size?.W && size?.H) return size;
  if (size === '1080x1080') return { W: 1080, H: 1080 };
  if (size === '1080') return { W: 1080, H: 1080 };
  if (size === '1080x1350') return { W: 1080, H: 1350 };
  if (size === '1200x630') return { W: 1200, H: 630 };
  if (size === '1280x720') return { W: 1280, H: 720 };
  if (size === '1080x1920') return { W: 1080, H: 1920 };
  if (size === '800x1200') return { W: 800, H: 1200 };
  if (size === '1200x628') return { W: 1200, H: 628 };
  return { W: 800, H: 800 };
}
