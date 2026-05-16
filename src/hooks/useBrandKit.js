import { useState, useCallback } from 'react';

const STORAGE_KEY = 'quotify-brands';
const MAX_BRANDS = 8;

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function persist(brands) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(brands)); }
  catch { /* quota exceeded */ }
}

export function useBrandKit() {
  const [brands, setBrands] = useState(load);

  const saveBrand = useCallback((name, config, logoDataUrl) => {
    const brand = {
      id:         Date.now(),
      name:       name || 'My Brand',
      savedAt:    new Date().toISOString(),
      logoDataUrl: logoDataUrl || null,
      config: {
        overlayColor:      config.overlayColor,
        overlayOpacity:    config.overlayOpacity,
        textColor:         config.textColor,
        fontStyle:         config.fontStyle,
        layoutTemplate:    config.layoutTemplate,
        textAlign:         config.textAlign,
        fontSizeMultiplier:config.fontSizeMultiplier,
        bgType:            config.bgType,
        theme:             config.theme,
        solidColor:        config.solidColor,
        gradientColor1:    config.gradientColor1,
        gradientColor2:    config.gradientColor2,
        gradientAngle:     config.gradientAngle,
        filterPreset:      config.filterPreset,
        logoPosition:      config.logoPosition,
        logoOpacity:       config.logoOpacity,
        logoSize:          config.logoSize,
      },
    };
    setBrands(prev => {
      const next = [brand, ...prev.filter(b => b.id !== brand.id)].slice(0, MAX_BRANDS);
      persist(next);
      return next;
    });
    return brand;
  }, []);

  const deleteBrand = useCallback((id) => {
    setBrands(prev => {
      const next = prev.filter(b => b.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { brands, saveBrand, deleteBrand };
}
