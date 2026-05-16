import { THEME_SEEDS } from './imageLibrary';

export const THEMES = Object.keys(THEME_SEEDS);

export const FONT_STYLES = ['sans', 'serif', 'script'];

export const ATTRIBUTION_STATUSES = [
  { value: 'attributed', label: 'Attributed' },
  { value: 'original', label: 'Original' },
  { value: 'anonymous', label: 'Anonymous' },
];

export const LAYOUT_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Balanced quote poster with editorial accents.',
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Large centered typography for hero quotes.',
  },
  {
    id: 'band',
    name: 'Split Band',
    description: 'Quote sits inside a cinematic translucent band.',
  },
  {
    id: 'frame',
    name: 'Frame',
    description: 'Inset card treatment for branded, polished layouts.',
  },
];

export const CSV_FIELDS = [
  'quote',
  'author',
  'theme',
  'font_style',
  'overlay_color',
  'source',
  'attribution_status',
];

export const CSV_FIELD_LABELS = {
  quote: 'Quote',
  author: 'Author',
  theme: 'Theme',
  font_style: 'Font Style',
  overlay_color: 'Overlay Color',
  source: 'Source',
  attribution_status: 'Attribution',
};

export const CSV_FIELD_ALIASES = {
  quote: ['quote', 'text', 'body', 'content', 'message', 'caption'],
  author: ['author', 'speaker', 'name', 'by', 'person', 'writer'],
  theme: ['theme', 'category', 'topic', 'background', 'bg', 'style_theme'],
  font_style: ['font_style', 'font', 'fontstyle', 'typeface', 'font_family'],
  overlay_color: ['overlay_color', 'overlay', 'tint', 'overlay_hex', 'color'],
  source: ['source', 'source_url', 'url', 'reference', 'citation', 'origin'],
  attribution_status: ['attribution_status', 'attribution', 'status', 'quote_type', 'type'],
};

export function normalizeToken(value) {
  return (value || '').toString().trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function normalizeTheme(value) {
  const theme = normalizeToken(value);
  return THEMES.includes(theme) ? theme : '';
}

export function normalizeFontStyle(value) {
  const fontStyle = normalizeToken(value);
  return FONT_STYLES.includes(fontStyle) ? fontStyle : '';
}

export function normalizeAttributionStatus(value) {
  const status = normalizeToken(value);
  if (!status) return '';
  if (['verified', 'attributed', 'source_backed', 'review'].includes(status)) return 'attributed';
  if (['original', 'generated', 'new'].includes(status)) return 'original';
  if (['anonymous', 'anon', 'unattributed'].includes(status)) return 'anonymous';
  return '';
}

export function formatAttributionStatus(value) {
  const match = ATTRIBUTION_STATUSES.find((item) => item.value === value);
  return match ? match.label : '';
}
