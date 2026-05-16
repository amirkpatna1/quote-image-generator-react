import {
  CSV_FIELD_ALIASES,
  CSV_FIELDS,
  normalizeAttributionStatus,
  normalizeFontStyle,
  normalizeTheme,
  normalizeToken,
} from './quoteOptions';

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function splitCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function cleanCell(value) {
  return (value || '').replace(/^['"]|['"]$/g, '').trim();
}

function normalizeOverlayColor(value) {
  const color = (value || '').trim();
  return HEX_COLOR_REGEX.test(color) ? color : '';
}

export function parseCSVWithMeta(text) {
  const cleaned = (text || '').replace(/^\uFEFF/, '').trim();
  if (!cleaned) return { headers: [], rows: [] };

  const lines = cleaned.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = splitCSVLine(lines[0]).map((header) => normalizeToken(cleanCell(header)));
  const rows = lines.slice(1).map((line) => {
    const fields = splitCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cleanCell(fields[index] || '');
    });
    return row;
  });

  return { headers, rows };
}

export function suggestColumnMapping(headers) {
  return CSV_FIELDS.reduce((mapping, field) => {
    const aliases = CSV_FIELD_ALIASES[field] || [];
    const directMatch = headers.find((header) => aliases.includes(normalizeToken(header)));
    const fuzzyMatch = headers.find((header) => {
      const normalized = normalizeToken(header);
      return aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized));
    });

    mapping[field] = directMatch || fuzzyMatch || '';
    return mapping;
  }, {});
}

export function normalizeMappedRows(rows, mapping) {
  return rows
    .map((row) => {
      const normalized = {
        quote: row[mapping.quote] || '',
        author: row[mapping.author] || '',
        theme: normalizeTheme(row[mapping.theme]),
        font_style: normalizeFontStyle(row[mapping.font_style]),
        overlay_color: normalizeOverlayColor(row[mapping.overlay_color]),
        source: row[mapping.source] || '',
        attribution_status: normalizeAttributionStatus(row[mapping.attribution_status]),
      };

      if (
        !normalized.quote &&
        !normalized.author &&
        !normalized.source &&
        !normalized.theme &&
        !normalized.font_style &&
        !normalized.overlay_color &&
        !normalized.attribution_status
      ) {
        return null;
      }

      return normalized;
    })
    .filter(Boolean);
}

export function getImportValidation(quotes, rawRows = [], mapping = {}) {
  const seenQuotes = new Set();
  let missingQuoteRows = 0;
  let duplicateRows = 0;
  let invalidThemeRows = 0;
  let invalidFontRows = 0;
  let invalidColorRows = 0;
  let missingSourceRows = 0;

  quotes.forEach((quote) => {
    const normalizedQuote = quote.quote.trim().toLowerCase();

    if (!quote.quote.trim()) {
      missingQuoteRows += 1;
    }

    if (normalizedQuote) {
      if (seenQuotes.has(normalizedQuote)) duplicateRows += 1;
      seenQuotes.add(normalizedQuote);
    }

    if (quote.attribution_status === 'attributed' && !quote.source.trim()) missingSourceRows += 1;
  });

  if (rawRows.length) {
    rawRows.forEach((row) => {
      const rawTheme = row[mapping.theme] || '';
      const rawFont = row[mapping.font_style] || '';
      const rawColor = row[mapping.overlay_color] || '';

      if (rawTheme.trim() && !normalizeTheme(rawTheme)) invalidThemeRows += 1;
      if (rawFont.trim() && !normalizeFontStyle(rawFont)) invalidFontRows += 1;
      if (rawColor.trim() && !normalizeOverlayColor(rawColor)) invalidColorRows += 1;
    });
  }

  return {
    totalRows: quotes.length,
    readyRows: quotes.filter((quote) => quote.quote.trim()).length,
    missingQuoteRows,
    duplicateRows,
    invalidThemeRows,
    invalidFontRows,
    invalidColorRows,
    missingSourceRows,
  };
}

export function dedupeQuotes(quotes) {
  const seenQuotes = new Set();
  return quotes.filter((quote) => {
    const normalizedQuote = quote.quote.trim().toLowerCase();
    if (!normalizedQuote) return true;
    if (seenQuotes.has(normalizedQuote)) return false;
    seenQuotes.add(normalizedQuote);
    return true;
  });
}

export function parseCSV(text) {
  const parsed = parseCSVWithMeta(text);
  const mapping = suggestColumnMapping(parsed.headers);
  return normalizeMappedRows(parsed.rows, mapping).filter((row) => row.quote.trim());
}

export const SAMPLE_CSV = `quote,author,theme,font_style,overlay_color,source,attribution_status
"The only way to do great work is to love what you do.",Steve Jobs,mountains,serif,#0a0a1a,Stanford Commencement Address,attributed
"In the middle of every difficulty lies opportunity.",Albert Einstein,ocean,sans,#041c2c,Attributed collection,attributed
"It does not matter how slowly you go as long as you do not stop.",Confucius,forest,sans,#0d1f0d,Analects,attributed
"Life is what happens when you're busy making other plans.",John Lennon,city,sans,#1a0a1a,Beautiful Boy,attributed
"The future belongs to those who believe in the beauty of their dreams.",Eleanor Roosevelt,flowers,script,#1a0a0a,Tomorrow Is Now,attributed
"Success is not final, failure is not fatal: it is the courage to continue that counts.",Winston Churchill,architecture,sans,#0a1a1a,Speech anthology,attributed
"You miss 100% of the shots you don't take.",Wayne Gretzky,sports,sans,#0a0a0a,Locker room attribution,attributed
"Whether you think you can or you think you can't, you're right.",Henry Ford,road,sans,#0f0c29,Leadership attribution,attributed
"Be yourself; everyone else is already taken.",Oscar Wilde,abstract,script,#1a001a,Collected quotations,attributed
"Two things are infinite: the universe and human stupidity.",Albert Einstein,space,serif,#000814,Popular attribution,attributed
"The only impossible journey is the one you never begin.",Tony Robbins,desert,sans,#1a0e00,Personal development speech,attributed
"Spread love everywhere you go.",Mother Teresa,sunset,script,#1a0a00,Collected sayings,attributed`;
