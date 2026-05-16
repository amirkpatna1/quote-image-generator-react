import { useState, useCallback } from 'react';

const STORAGE_KEY = 'quotify-history';
const MAX_ENTRIES = 5;

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function save(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  catch { /* quota exceeded */ }
}

export function useHistory() {
  const [history, setHistory] = useState(load);

  const saveEntry = useCallback((quotes, config, variantOffsets) => {
    const entry = {
      id:        Date.now(),
      savedAt:   new Date().toISOString(),
      count:     quotes.length,
      quotes,
      variantOffsets,
      config: {
        bgType:           config.bgType,
        theme:            config.theme,
        solidColor:       config.solidColor,
        gradientColor1:   config.gradientColor1,
        gradientColor2:   config.gradientColor2,
        gradientAngle:    config.gradientAngle,
        overlayColor:     config.overlayColor,
        overlayOpacity:   config.overlayOpacity,
        textColor:        config.textColor,
        fontStyle:        config.fontStyle,
        layoutTemplate:   config.layoutTemplate,
        textAlign:        config.textAlign,
        fontSizeMultiplier: config.fontSizeMultiplier,
        size:             config.size,
        filterPreset:     config.filterPreset,
        logoPosition:     config.logoPosition,
        logoOpacity:      config.logoOpacity,
        logoSize:         config.logoSize,
        activePreset:     config.activePreset,
      },
    };
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      save(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    save([]);
    setHistory([]);
  }, []);

  return { history, saveEntry, removeEntry, clearHistory };
}
