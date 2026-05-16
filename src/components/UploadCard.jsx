import { useRef, useState } from 'react';
import {
  dedupeQuotes,
  getImportValidation,
  normalizeMappedRows,
  parseCSVWithMeta,
  SAMPLE_CSV,
  suggestColumnMapping,
} from '../utils/csvParser';
import {
  ATTRIBUTION_STATUSES,
  CSV_FIELDS,
  CSV_FIELD_LABELS,
  FONT_STYLES,
  THEMES,
} from '../utils/quoteOptions';
import AddQuoteForm from './AddQuoteForm';
import AIQuoteGenerator from './AIQuoteGenerator';
import HistoryPanel from './HistoryPanel';

const EMPTY_MAPPING = Object.fromEntries(CSV_FIELDS.map((field) => [field, '']));

const CSV_TEMPLATE = `quote,author,theme,font_style,overlay_color,source,attribution_status
"Your quote here",Author Name,nature,sans,#000000,Book or speech,attributed
"Fresh original line",,minimal,script,,,
`;

const EDITABLE_COLUMNS = [
  { key: 'quote', type: 'textarea' },
  { key: 'author', type: 'text' },
  { key: 'theme', type: 'select', options: [''].concat(THEMES) },
  { key: 'font_style', type: 'select', options: [''].concat(FONT_STYLES) },
  { key: 'overlay_color', type: 'text' },
  { key: 'attribution_status', type: 'select', options: [''].concat(ATTRIBUTION_STATUSES.map((item) => item.value)) },
  { key: 'source', type: 'text' },
];

export default function UploadCard({ onNext, history, onLoadHistory, onDeleteHistory, onClearHistory }) {
  const [quotes, setQuotes] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState(EMPTY_MAPPING);
  const [bulkTheme, setBulkTheme] = useState('');
  const [bulkFontStyle, setBulkFontStyle] = useState('');
  const [bulkAttributionStatus, setBulkAttributionStatus] = useState('');
  const fileRef = useRef();

  const validation = getImportValidation(quotes, rawRows, columnMapping);
  const canProceed = quotes.some((quote) => quote.quote.trim());

  function resetImportedState() {
    setAvailableHeaders([]);
    setRawRows([]);
    setColumnMapping(EMPTY_MAPPING);
  }

  function applyImportedText(name, text) {
    const parsed = parseCSVWithMeta(text);
    const mapping = suggestColumnMapping(parsed.headers);

    setFileName(name);
    setBulkTheme('');
    setBulkFontStyle('');
    setBulkAttributionStatus('');
    setAvailableHeaders(parsed.headers);
    setRawRows(parsed.rows);
    setColumnMapping(mapping);
    setQuotes(normalizeMappedRows(parsed.rows, mapping));
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) return;
    const reader = new FileReader();
    reader.onload = (event) => applyImportedText(file.name, event.target.result);
    reader.readAsText(file);
  }

  function updateMapping(field, header) {
    const next = { ...columnMapping, [field]: header };
    setColumnMapping(next);
    if (rawRows.length) setQuotes(normalizeMappedRows(rawRows, next));
  }

  function updateQuote(index, key, value) {
    setQuotes((prev) => prev.map((quote, rowIndex) => (
      rowIndex === index ? { ...quote, [key]: value } : quote
    )));
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quotify-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function loadSample() {
    applyImportedText('sample-quotes.csv', SAMPLE_CSV);
  }

  function addManual(quote) {
    setQuotes((prev) => [...prev, quote]);
  }

  function addFromAI(quote) {
    setQuotes((prev) => [...prev, quote]);
  }

  function removeQuote(index) {
    setQuotes((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  }

  function clearAll() {
    setQuotes([]);
    setFileName('');
    setBulkTheme('');
    setBulkFontStyle('');
    setBulkAttributionStatus('');
    resetImportedState();
  }

  function handleLoadHistory(entry) {
    setQuotes(entry.quotes);
    setFileName('(from history)');
    setBulkTheme('');
    setBulkFontStyle('');
    setBulkAttributionStatus('');
    resetImportedState();
    onLoadHistory(entry);
  }

  function applyBulkChanges() {
    if (!bulkTheme && !bulkFontStyle && !bulkAttributionStatus) return;
    setQuotes((prev) => prev.map((quote) => ({
      ...quote,
      ...(bulkTheme ? { theme: bulkTheme } : {}),
      ...(bulkFontStyle ? { font_style: bulkFontStyle } : {}),
      ...(bulkAttributionStatus ? { attribution_status: bulkAttributionStatus } : {}),
    })));
  }

  function handleDedupe() {
    setQuotes((prev) => dedupeQuotes(prev));
  }

  function renderEditableCell(row, index, column) {
    if (column.type === 'textarea') {
      return (
        <textarea
          className="table-textarea"
          value={row[column.key] || ''}
          onChange={(event) => updateQuote(index, column.key, event.target.value)}
          placeholder="Quote text"
        />
      );
    }

    if (column.type === 'select') {
      return (
        <select
          className="table-select"
          value={row[column.key] || ''}
          onChange={(event) => updateQuote(index, column.key, event.target.value)}
        >
          <option value="">—</option>
          {column.options.filter(Boolean).map((option) => (
            <option key={option} value={option}>
              {column.key === 'attribution_status'
                ? ATTRIBUTION_STATUSES.find((item) => item.value === option)?.label || option
                : option}
            </option>
          ))}
        </select>
      );
    }

    if (column.key === 'overlay_color') {
      return (
        <div className="table-color-field">
          <span
            className="table-color-swatch"
            style={{ background: row.overlay_color || 'transparent' }}
          />
          <input
            className="table-input table-input-mono"
            type="text"
            value={row.overlay_color || ''}
            onChange={(event) => updateQuote(index, column.key, event.target.value)}
            placeholder="#000000"
          />
        </div>
      );
    }

    return (
      <input
        className="table-input"
        type="text"
        value={row[column.key] || ''}
        onChange={(event) => updateQuote(index, column.key, event.target.value)}
        placeholder={CSV_FIELD_LABELS[column.key]}
      />
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">📂</div>
          <div>
            <h2>Import Quotes</h2>
            <p>Upload CSV, clean rows inline, or generate trusted AI copy</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAI(true)}>
            ✦ AI Generate
          </button>
          <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
            ⬇ CSV Template
          </button>
        </div>
      </div>

      <div
        className={`upload-zone ${dragging ? 'drag' : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
      >
        <div className="upload-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent-light)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <h3>{dragging ? 'Drop it here!' : 'Drop your CSV here'}</h3>
        <p>or <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>click to browse</span></p>
        <p className="sub">Column mapping is auto-detected and can be adjusted below.</p>
        <div className="upload-chip">{fileName ? `📄 ${fileName}` : 'No file selected'}</div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(event) => handleFile(event.target.files[0])}
        />
      </div>

      <div className="format-hint">
        <span className="format-hint-icon">💡</span>
        <p>
          <strong style={{ color: 'var(--text)' }}>Optional columns:</strong>{' '}
          <code>author</code>, <code>theme</code>, <code>font_style</code>, <code>overlay_color</code>,
          <code>source</code>, <code>attribution_status</code>. Use
          <code>attributed</code> for sourced quotes and <code>original</code> for fresh copy.
        </p>
      </div>

      <button className="sample-btn" onClick={loadSample}>
        <span>✦</span> Try with 12 sample quotes
      </button>

      {availableHeaders.length > 0 && (
        <div className="import-mapper">
          <div className="import-mapper-header">
            <div>
              <h3>Smart Column Mapping</h3>
              <p>We mapped your headers automatically. Adjust if your spreadsheet uses custom names.</p>
            </div>
            <span className={`status-pill ${columnMapping.quote ? 'ok' : 'warn'}`}>
              {columnMapping.quote ? 'Quote column mapped' : 'Map the quote column to continue'}
            </span>
          </div>

          <div className="mapping-grid">
            {CSV_FIELDS.map((field) => (
              <div key={field} className="field">
                <label>{CSV_FIELD_LABELS[field]}</label>
                <select
                  value={columnMapping[field] || ''}
                  onChange={(event) => updateMapping(field, event.target.value)}
                >
                  <option value="">— Ignore —</option>
                  {availableHeaders.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="validation-row">
            <ValidationChip tone="ok" label={`${validation.readyRows} ready`} />
            {validation.missingQuoteRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.missingQuoteRows} blank quote`} />
            )}
            {validation.duplicateRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.duplicateRows} duplicate`} />
            )}
            {validation.invalidThemeRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.invalidThemeRows} bad theme`} />
            )}
            {validation.invalidFontRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.invalidFontRows} bad font`} />
            )}
            {validation.invalidColorRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.invalidColorRows} bad color`} />
            )}
            {validation.missingSourceRows > 0 && (
              <ValidationChip tone="warn" label={`${validation.missingSourceRows} missing source`} />
            )}
          </div>
        </div>
      )}

      <AddQuoteForm onAdd={addManual} />

      <HistoryPanel
        history={history}
        onLoad={handleLoadHistory}
        onDelete={onDeleteHistory}
        onClear={onClearHistory}
      />

      {quotes.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="preview-header-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Preview &amp; Bulk Edit</span>
                <span className="badge-count">{quotes.length}</span>
              </div>
              <p className="preview-subcopy">Clean rows here before generating images.</p>
            </div>
            <div className="preview-actions">
              <button className="btn btn-ghost btn-xs" onClick={handleDedupe}>Remove duplicates</button>
              <button className="btn btn-ghost btn-xs" onClick={clearAll}>Clear all</button>
            </div>
          </div>

          <div className="bulk-editor">
            <div className="bulk-editor-row">
              <div className="field">
                <label>Apply theme to all rows</label>
                <select value={bulkTheme} onChange={(event) => setBulkTheme(event.target.value)}>
                  <option value="">— Leave as-is —</option>
                  {THEMES.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Apply font to all rows</label>
                <select value={bulkFontStyle} onChange={(event) => setBulkFontStyle(event.target.value)}>
                  <option value="">— Leave as-is —</option>
                  {FONT_STYLES.map((fontStyle) => <option key={fontStyle} value={fontStyle}>{fontStyle}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Apply attribution to all rows</label>
                <select value={bulkAttributionStatus} onChange={(event) => setBulkAttributionStatus(event.target.value)}>
                  <option value="">— Leave as-is —</option>
                  {ATTRIBUTION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-outline btn-sm" onClick={applyBulkChanges}>
                Apply to All
              </button>
            </div>
          </div>

          <div className="table-wrap editable-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {EDITABLE_COLUMNS.map((column) => (
                    <th key={column.key}>{CSV_FIELD_LABELS[column.key]}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {quotes.map((row, index) => (
                  <tr key={`${row.quote}-${index}`}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                    {EDITABLE_COLUMNS.map((column) => (
                      <td key={column.key} className={column.key === 'quote' ? 'td-quote td-quote-edit' : ''}>
                        {renderEditableCell(row, index, column)}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => removeQuote(index)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => onNext(quotes.filter((quote) => quote.quote.trim()))} disabled={!canProceed}>
              Configure Style
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {validation.readyRows} ready for generation
            </span>
          </div>
        </div>
      )}

      {showAI && (
        <AIQuoteGenerator onAdd={addFromAI} onClose={() => setShowAI(false)} />
      )}
    </div>
  );
}

function ValidationChip({ label, tone }) {
  return <span className={`validation-chip ${tone}`}>{label}</span>;
}
