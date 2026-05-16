import { useRef } from 'react';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function useUnsplash() {
  const cache = useRef({});

  async function fetchImage(keyword, accessKey) {
    if (!accessKey) return null;
    const key = (keyword || 'nature').toLowerCase().trim();
    if (cache.current[key]) return cache.current[key];
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(key)}&orientation=squarish&client_id=${accessKey}`
      );
      if (!res.ok) throw new Error(`Unsplash ${res.status}`);
      const data = await res.json();
      const img = await loadImage(data.urls.regular);
      cache.current[key] = img;
      return img;
    } catch {
      return null;
    }
  }

  function clearCache() {
    cache.current = {};
  }

  return { fetchImage, clearCache };
}
