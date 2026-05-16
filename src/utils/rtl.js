// Unicode ranges for RTL scripts: Arabic, Hebrew, Persian, Urdu, etc.
const RTL_REGEX = /[֑-߿‏‫‮יִ-﷽ﹰ-ﻼ]/;

export function isRTL(text) {
  return RTL_REGEX.test(text);
}

/**
 * Returns canvas textAlign and layout direction based on text content.
 * Respects an explicit userAlign override (left/center/right).
 */
export function resolveTextAlign(text, userAlign) {
  if (userAlign && userAlign !== 'auto') return userAlign;
  return isRTL(text) ? 'right' : 'left';
}

export function resolveCanvasDirection(text) {
  return isRTL(text) ? 'rtl' : 'ltr';
}
