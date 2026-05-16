const HASH_KEY = 'q';

export function encodeShareLink(quotes, config) {
  try {
    const payload = {
      v: 1,
      quotes,
      config: {
        bgType:             config.bgType,
        theme:              config.theme,
        solidColor:         config.solidColor,
        gradientColor1:     config.gradientColor1,
        gradientColor2:     config.gradientColor2,
        gradientAngle:      config.gradientAngle,
        overlayColor:       config.overlayColor,
        overlayOpacity:     config.overlayOpacity,
        textColor:          config.textColor,
        fontStyle:          config.fontStyle,
        layoutTemplate:     config.layoutTemplate,
        textAlign:          config.textAlign,
        fontSizeMultiplier: config.fontSizeMultiplier,
        size:               config.size,
        filterPreset:       config.filterPreset,
        // logo excluded — can't serialize Image objects
      },
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    return `${window.location.origin}${window.location.pathname}#${HASH_KEY}=${encoded}`;
  } catch {
    return null;
  }
}

export function decodeShareLink() {
  try {
    const hash = window.location.hash;
    const match = hash.match(new RegExp(`#${HASH_KEY}=(.+)`));
    if (!match) return null;
    const parsed = JSON.parse(decodeURIComponent(atob(match[1])));
    if (parsed.v !== 1 || !Array.isArray(parsed.quotes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearShareHash() {
  history.replaceState(null, '', window.location.pathname);
}
