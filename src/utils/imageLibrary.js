// Curated Picsum photo seeds that produce consistently beautiful,
// mood-appropriate backgrounds for quote images.
// Format: https://picsum.photos/seed/{seed}/1080/1080
// Each theme has multiple variants — we rotate based on quote index.

export const THEME_SEEDS = {
  mountains:    ['mountain', 'alpine', 'summit', 'peak', 'glacier'],
  ocean:        ['ocean', 'waves', 'coastal', 'sea', 'shore'],
  forest:       ['forest', 'woods', 'trees', 'jungle', 'fern'],
  city:         ['city', 'urban', 'skyline', 'metro', 'street'],
  sunset:       ['sunset', 'dusk', 'horizon', 'twilight', 'golden'],
  flowers:      ['flowers', 'bloom', 'petals', 'garden', 'blossom'],
  abstract:     ['abstract', 'texture', 'minimal', 'pattern', 'art'],
  space:        ['galaxy', 'nebula', 'cosmos', 'stars', 'milky'],
  desert:       ['desert', 'dunes', 'sand', 'arid', 'sahara'],
  architecture: ['architecture', 'building', 'bridge', 'hall', 'cathedral'],
  road:         ['road', 'highway', 'path', 'trail', 'journey'],
  sports:       ['sports', 'action', 'athlete', 'stadium', 'game'],
  nature:       ['nature', 'landscape', 'scenic', 'wilderness', 'terrain'],
  winter:       ['winter', 'snow', 'frost', 'blizzard', 'ice'],
  rain:         ['rain', 'storm', 'clouds', 'misty', 'fog'],
  beach:        ['beach', 'tropical', 'palm', 'lagoon', 'paradise'],
  minimal:      ['minimal', 'clean', 'white', 'simple', 'light'],
  dark:         ['night', 'dark', 'noir', 'shadow', 'moody'],
};

// Fallback gradient palettes when image loading fails
export const FALLBACK_GRADIENTS = [
  { stops: ['#0f0c29', '#302b63', '#24243e'], angle: 135 },
  { stops: ['#134e5e', '#71b280'],            angle: 160 },
  { stops: ['#1a1a2e', '#16213e', '#0f3460'], angle: 120 },
  { stops: ['#355c7d', '#6c5b7b', '#c06c84'], angle: 145 },
  { stops: ['#2d3561', '#c05c7e', '#f3826f'], angle: 130 },
  { stops: ['#0d0d0d', '#1a1a2e'],            angle: 180 },
  { stops: ['#200122', '#6f0000'],            angle: 135 },
  { stops: ['#005c97', '#363795'],            angle: 150 },
  { stops: ['#1d2671', '#c33764'],            angle: 125 },
  { stops: ['#0a3d62', '#1e3799'],            angle: 140 },
  { stops: ['#1e272e', '#485460'],            angle: 155 },
  { stops: ['#2c3e50', '#4ca1af'],            angle: 135 },
];

// Style presets — each is a full config a user can pick from
export const STYLE_PRESETS = [
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    overlayColor: '#000000',
    overlayOpacity: 0.55,
    fontStyle: 'serif',
    theme: 'dark',
    textColor: '#ffffff',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    emoji: '🌅',
    overlayColor: '#1a0900',
    overlayOpacity: 0.45,
    fontStyle: 'script',
    theme: 'sunset',
    textColor: '#ffd700',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    emoji: '🌊',
    overlayColor: '#001a2e',
    overlayOpacity: 0.5,
    fontStyle: 'sans',
    theme: 'ocean',
    textColor: '#e0f7fa',
  },
  {
    id: 'forest',
    name: 'Forest Calm',
    emoji: '🌲',
    overlayColor: '#0a1a0a',
    overlayOpacity: 0.5,
    fontStyle: 'sans',
    theme: 'forest',
    textColor: '#c8e6c9',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '◻️',
    overlayColor: '#ffffff',
    overlayOpacity: 0.7,
    fontStyle: 'sans',
    theme: 'minimal',
    textColor: '#1a1a2e',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    emoji: '✨',
    overlayColor: '#0a0015',
    overlayOpacity: 0.5,
    fontStyle: 'serif',
    theme: 'space',
    textColor: '#e8d5ff',
  },
];

export function getPicsumUrl(theme, variantIndex, size = 1080) {
  const key = (theme || 'nature').toLowerCase().trim();
  const seeds = THEME_SEEDS[key] || THEME_SEEDS['nature'];
  const seed = seeds[variantIndex % seeds.length];
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const imageCache = new Map();

export async function fetchThemeImage(theme, variantIndex, size = 1080) {
  const cacheKey = `${theme}-${variantIndex}-${size}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
  const url = getPicsumUrl(theme, variantIndex, size);
  try {
    const img = await loadImage(url);
    imageCache.set(cacheKey, img);
    return img;
  } catch {
    return null;
  }
}

export function clearImageCache() {
  imageCache.clear();
}
