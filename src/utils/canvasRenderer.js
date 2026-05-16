import { FALLBACK_GRADIENTS } from './imageLibrary';
import { applyCanvasFilter, FILTER_PRESETS } from './filters';
import { isRTL } from './rtl';

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const FONT_FACE = {
  serif: (size) => `700 ${size}px 'Playfair Display', Georgia, "Times New Roman", serif`,
  sans: (size) => `600 ${size}px 'Inter', "Segoe UI", Arial, sans-serif`,
  script: (size) => `italic 700 ${size}px 'Playfair Display', Palatino, serif`,
};

const AUTHOR_FONT = {
  serif: (size) => `400 ${size}px Georgia, serif`,
  sans: (size) => `400 ${size}px 'Inter', "Segoe UI", sans-serif`,
  script: (size) => `italic 400 ${size}px Palatino, serif`,
};

export function hexToRgba(hex, alpha) {
  let value = (hex || '#000000').replace('#', '');
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isValidHexColor(value) {
  return HEX_COLOR_REGEX.test((value || '').trim());
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawFallbackGradient(ctx, W, H, index) {
  const gradientConfig = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const radians = (gradientConfig.angle * Math.PI) / 180;
  const cx = W / 2;
  const cy = H / 2;
  const gradient = ctx.createLinearGradient(
    cx - Math.cos(radians) * W,
    cy - Math.sin(radians) * H,
    cx + Math.cos(radians) * W,
    cy + Math.sin(radians) * H,
  );

  gradientConfig.stops.forEach((color, colorIndex) => {
    gradient.addColorStop(colorIndex / (gradientConfig.stops.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawSolidBg(ctx, W, H, color) {
  ctx.fillStyle = color || '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
}

function drawCustomGradient(ctx, W, H, color1, color2, angle) {
  const radians = ((angle || 135) * Math.PI) / 180;
  const cx = W / 2;
  const cy = H / 2;
  const gradient = ctx.createLinearGradient(
    cx - Math.cos(radians) * W,
    cy - Math.sin(radians) * H,
    cx + Math.cos(radians) * W,
    cy + Math.sin(radians) * H,
  );
  gradient.addColorStop(0, color1 || '#1a1a2e');
  gradient.addColorStop(1, color2 || '#4a0080');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawVignette(ctx, W, H) {
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.85);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawAccents(ctx, W, H, textColor, rtl) {
  const color = textColor || '#ffffff';
  const barX = rtl ? W * 0.91 : W * 0.07;
  const gradient = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.82);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.5, hexToRgba(color, 0.45));
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(barX, H * 0.15, 2.5, H * 0.7);

  ctx.save();
  ctx.fillStyle = hexToRgba(color, 0.18);
  ctx.translate(rtl ? W * 0.12 : W * 0.88, H * 0.89);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawPanel(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
  ctx.restore();
}

function fitTextBlock(ctx, text, fontStyle, maxWidth, initialSize, minSize, maxLines, lineHeightRatio = 1.55) {
  let fontSize = initialSize;
  let lines = [];

  while (fontSize >= minSize) {
    ctx.font = FONT_FACE[fontStyle](fontSize);
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    fontSize -= 2;
  }

  const lineHeight = fontSize * lineHeightRatio;
  return {
    fontSize,
    lines,
    lineHeight,
    totalHeight: lines.length * lineHeight,
  };
}

function drawQuoteMarks(ctx, W, H, padding, textColor, rtl, scale = 1) {
  ctx.save();
  ctx.fillStyle = hexToRgba(textColor, 0.14);
  ctx.font = `italic ${W * 0.18 * scale}px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = rtl ? 'right' : 'left';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.fillText(rtl ? '“' : '"', rtl ? W - padding * 0.8 : padding * 0.8, H * 0.28);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = hexToRgba(textColor, 0.1);
  ctx.font = `italic ${W * 0.14 * scale}px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = rtl ? 'left' : 'right';
  ctx.fillText(rtl ? '”' : '"', rtl ? padding * 0.65 : W - padding * 0.65, H * 0.84);
  ctx.restore();
}

function drawTextLines(ctx, lines, alignX, startY, lineHeight, fontStyle, fontSize, textColor, textAlign, rtl) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = textColor;
  ctx.font = FONT_FACE[fontStyle](fontSize);
  ctx.textAlign = textAlign;
  ctx.direction = rtl ? 'rtl' : 'ltr';
  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, alignX, startY + lineIndex * lineHeight);
  });
  ctx.restore();
}

function getAuthorLabel(quote) {
  if (quote.author) return quote.author;
  if (quote.attribution_status === 'original') return 'Original aphorism';
  return '';
}

function getContextLabel(quote) {
  if (quote.source) return quote.source.length > 34 ? `${quote.source.slice(0, 34)}…` : quote.source;
  if (quote.attribution_status === 'original') return 'Original';
  if (quote.theme) return quote.theme;
  return '';
}

function drawContextPill(ctx, x, y, label, textColor, align = 'left') {
  if (!label) return;
  ctx.save();
  const fontSize = 20;
  ctx.font = `600 ${fontSize}px 'Inter', "Segoe UI", sans-serif`;
  const textWidth = ctx.measureText(label).width;
  const padX = 16;
  const width = textWidth + padX * 2;
  const height = 36;
  const pillX = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  drawRoundedRect(ctx, pillX, y - height / 2, width, height, 18);
  ctx.fillStyle = 'rgba(6,10,16,0.45)';
  ctx.fill();
  ctx.strokeStyle = hexToRgba(textColor, 0.2);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = hexToRgba(textColor, 0.84);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + 1);
  ctx.restore();
}

function drawClassicLayout(ctx, quote, layout) {
  const {
    W,
    H,
    padding,
    textColor,
    fontStyle,
    textAlign,
    rtl,
  } = layout;

  drawAccents(ctx, W, H, textColor, rtl);
  drawQuoteMarks(ctx, W, H, padding, textColor, rtl, 1);

  const textBlock = fitTextBlock(ctx, quote.quote || '', fontStyle, W - padding * 2, Math.round(W * 0.058 * layout.fontSizeMultiplier), Math.round(W * 0.026), 7);
  const authorLabel = getAuthorLabel(quote);
  const authorHeight = authorLabel ? Math.round(textBlock.fontSize * 0.62) * 2.4 : 0;
  const startY = (H - textBlock.totalHeight - authorHeight) / 2 + textBlock.fontSize;

  const alignX = textAlign === 'center' ? W / 2 : textAlign === 'right' ? W - padding : padding;
  drawTextLines(ctx, textBlock.lines, alignX, startY, textBlock.lineHeight, fontStyle, textBlock.fontSize, textColor, textAlign, rtl);

  if (authorLabel) {
    const authorSize = Math.round(textBlock.fontSize * 0.58);
    const authorY = startY + textBlock.totalHeight + authorSize * 1.1;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.font = AUTHOR_FONT[fontStyle](authorSize);
    ctx.fillStyle = hexToRgba(textColor, 0.78);
    ctx.textAlign = textAlign;
    ctx.direction = rtl ? 'rtl' : 'ltr';

    const dividerX = textAlign === 'center' ? W / 2 - 16 : textAlign === 'right' ? W - padding - 44 : padding;
    ctx.strokeStyle = hexToRgba(textColor, 0.3);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dividerX, authorY - authorSize * 0.55);
    ctx.lineTo(dividerX + 32, authorY - authorSize * 0.55);
    ctx.stroke();

    const label = textAlign === 'center' ? `— ${authorLabel}` : `  ${authorLabel}`;
    ctx.fillText(label, alignX + (textAlign === 'left' ? 36 : 0), authorY);
    ctx.restore();
  }
}

function drawSpotlightLayout(ctx, quote, layout) {
  const { W, H, textColor, fontStyle } = layout;
  const label = getContextLabel(quote);

  drawContextPill(ctx, W / 2, H * 0.16, label, textColor, 'center');

  const maxWidth = W * 0.72;
  const textBlock = fitTextBlock(ctx, quote.quote || '', fontStyle, maxWidth, Math.round(W * 0.07 * layout.fontSizeMultiplier), Math.round(W * 0.03), 6, 1.48);
  const startY = H * 0.48 - textBlock.totalHeight / 2 + textBlock.fontSize * 0.35;

  drawTextLines(ctx, textBlock.lines, W / 2, startY, textBlock.lineHeight, fontStyle, textBlock.fontSize, textColor, 'center', layout.rtl);

  const authorLabel = getAuthorLabel(quote);
  if (authorLabel) {
    drawContextPill(ctx, W / 2, H * 0.79, authorLabel, textColor, 'center');
  }
}

function drawBandLayout(ctx, quote, layout) {
  const { W, H, textColor, fontStyle } = layout;
  const bandX = W * 0.08;
  const bandY = H * 0.26;
  const bandW = W * 0.84;
  const bandH = H * 0.48;

  drawPanel(ctx, bandX, bandY, bandW, bandH, 28, 'rgba(6,10,16,0.38)', 'rgba(255,255,255,0.12)');

  const label = getContextLabel(quote);
  drawContextPill(ctx, W / 2, bandY + 34, label, textColor, 'center');

  const textBlock = fitTextBlock(ctx, quote.quote || '', fontStyle, bandW * 0.78, Math.round(W * 0.058 * layout.fontSizeMultiplier), Math.round(W * 0.03), 6, 1.5);
  const textStartY = bandY + bandH * 0.45 - textBlock.totalHeight / 2 + textBlock.fontSize * 0.4;
  drawTextLines(ctx, textBlock.lines, W / 2, textStartY, textBlock.lineHeight, fontStyle, textBlock.fontSize, textColor, 'center', layout.rtl);

  const authorLabel = getAuthorLabel(quote);
  if (authorLabel) {
    drawContextPill(ctx, W / 2, bandY + bandH - 34, authorLabel, textColor, 'center');
  }
}

function drawFrameLayout(ctx, quote, layout) {
  const { W, H, padding, textColor, fontStyle, textAlign, rtl } = layout;
  const panelX = W * 0.08;
  const panelY = H * 0.1;
  const panelW = W * 0.84;
  const panelH = H * 0.8;

  drawPanel(ctx, panelX, panelY, panelW, panelH, 34, 'rgba(9,12,20,0.32)', hexToRgba(textColor, 0.25));
  drawAccents(ctx, W, H, textColor, rtl);

  const label = getContextLabel(quote);
  const pillAnchor = textAlign === 'center' ? W / 2 : textAlign === 'right' ? panelX + panelW - 40 : panelX + 40;
  drawContextPill(ctx, pillAnchor, panelY + 34, label, textColor, textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left');

  const textBlock = fitTextBlock(ctx, quote.quote || '', fontStyle, panelW - padding * 1.15, Math.round(W * 0.054 * layout.fontSizeMultiplier), Math.round(W * 0.028), 6);
  const authorLabel = getAuthorLabel(quote);
  const authorSpace = authorLabel ? 60 : 0;
  const textStartY = panelY + panelH / 2 - (textBlock.totalHeight + authorSpace) / 2 + textBlock.fontSize * 0.45;
  const alignX = textAlign === 'center' ? W / 2 : textAlign === 'right' ? panelX + panelW - padding * 0.55 : panelX + padding * 0.55;

  drawTextLines(ctx, textBlock.lines, alignX, textStartY, textBlock.lineHeight, fontStyle, textBlock.fontSize, textColor, textAlign, rtl);

  if (authorLabel) {
    const authorY = textStartY + textBlock.totalHeight + 34;
    drawContextPill(ctx, alignX, authorY, authorLabel, textColor, textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left');
  }
}

function drawLogo(ctx, W, H, logoImage, position, opacity, size) {
  if (!logoImage) return;
  const logoWidth = Math.round(W * (size || 0.1));
  const margin = Math.round(W * 0.04);
  const aspect = logoImage.width / logoImage.height;
  const width = logoWidth;
  const height = Math.round(logoWidth / aspect);
  let x;
  let y;

  switch (position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = W - width - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = H - height - margin;
      break;
    default:
      x = W - width - margin;
      y = H - height - margin;
      break;
  }

  ctx.save();
  ctx.globalAlpha = opacity ?? 0.85;
  ctx.drawImage(logoImage, x, y, width, height);
  ctx.restore();
}

export function drawQuoteOnCanvas(canvas, quote, index, config, bgImage) {
  const {
    W,
    H,
    fontStyle = 'sans',
    overlayColor = '#000000',
    overlayOpacity = 0.5,
    textColor = '#ffffff',
    textAlign = 'center',
    bgType = 'photo',
    solidColor,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    fontSizeMultiplier = 1,
    filterPreset,
    logoImage,
    logoPosition = 'bottom-right',
    logoOpacity = 0.85,
    logoSize = 0.1,
    layoutTemplate = 'classic',
  } = config;

  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  const quoteText = quote.quote || '';
  const rtl = isRTL(quoteText);
  const effectiveAlign = textAlign === 'center' ? 'center' : rtl && textAlign !== 'left' ? 'right' : textAlign;
  const resolvedFontStyle = quote.font_style || fontStyle;
  const resolvedOverlayColor = isValidHexColor(quote.overlay_color) ? quote.overlay_color : overlayColor;

  if (bgType === 'solid') {
    drawSolidBg(ctx, W, H, solidColor);
  } else if (bgType === 'gradient') {
    drawCustomGradient(ctx, W, H, gradientColor1, gradientColor2, gradientAngle);
  } else if (bgImage) {
    const scale = Math.max(W / bgImage.width, H / bgImage.height);
    const scaledWidth = bgImage.width * scale;
    const scaledHeight = bgImage.height * scale;
    ctx.drawImage(bgImage, (W - scaledWidth) / 2, (H - scaledHeight) / 2, scaledWidth, scaledHeight);
  } else {
    drawFallbackGradient(ctx, W, H, index);
  }

  if (bgType === 'photo') drawVignette(ctx, W, H);

  ctx.fillStyle = hexToRgba(resolvedOverlayColor, overlayOpacity);
  ctx.fillRect(0, 0, W, H);

  const layout = {
    W,
    H,
    padding: W * 0.12,
    textColor: textColor || '#ffffff',
    fontStyle: resolvedFontStyle,
    textAlign: effectiveAlign,
    fontSizeMultiplier,
    rtl,
  };

  switch (layoutTemplate) {
    case 'spotlight':
      drawSpotlightLayout(ctx, quote, layout);
      break;
    case 'band':
      drawBandLayout(ctx, quote, layout);
      break;
    case 'frame':
      drawFrameLayout(ctx, quote, layout);
      break;
    default:
      drawClassicLayout(ctx, quote, layout);
      break;
  }

  drawLogo(ctx, W, H, logoImage, logoPosition, logoOpacity, logoSize);

  if (filterPreset && filterPreset !== 'none') {
    const preset = FILTER_PRESETS.find((item) => item.id === filterPreset);
    if (preset) applyCanvasFilter(canvas, preset.filter);
  }
}
