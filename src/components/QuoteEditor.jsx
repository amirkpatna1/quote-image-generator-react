import { useEffect, useState } from 'react';
import {
  ATTRIBUTION_STATUSES,
  FONT_STYLES,
  THEMES,
} from '../utils/quoteOptions';

export default function QuoteEditor({ quote, index, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...quote }));

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!quote) return null;

  function set(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="editor-modal-backdrop open" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="editor-modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3>✏️ Edit Quote #{index + 1}</h3>
          <button className="btn btn-ghost btn-xs" onClick={onClose}>✕ Close</button>
        </div>

        <div>
          <label>Quote Text *</label>
          <textarea
            value={draft.quote || ''}
            onChange={(event) => set('quote', event.target.value)}
            placeholder="Enter your quote here…"
          />
        </div>

        <div className="editor-modal-grid">
          <div>
            <label>Author</label>
            <input
              type="text"
              value={draft.author || ''}
              onChange={(event) => set('author', event.target.value)}
              placeholder="Author name"
            />
          </div>
          <div>
            <label>Theme</label>
            <select value={draft.theme || ''} onChange={(event) => set('theme', event.target.value)}>
              <option value="">— Use global —</option>
              {THEMES.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
            </select>
          </div>
          <div>
            <label>Font Style</label>
            <select value={draft.font_style || ''} onChange={(event) => set('font_style', event.target.value)}>
              <option value="">— Use global —</option>
              {FONT_STYLES.map((fontStyle) => <option key={fontStyle} value={fontStyle}>{fontStyle}</option>)}
            </select>
          </div>
          <div>
            <label>Attribution</label>
            <select value={draft.attribution_status || ''} onChange={(event) => set('attribution_status', event.target.value)}>
              <option value="">— Optional —</option>
              {ATTRIBUTION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Source</label>
            <input
              type="text"
              value={draft.source || ''}
              onChange={(event) => set('source', event.target.value)}
              placeholder="Book, speech, interview, article…"
            />
          </div>
          <div>
            <label>Overlay Color</label>
            <input
              type="color"
              value={draft.overlay_color || '#000000'}
              onChange={(event) => set('overlay_color', event.target.value)}
              style={{ height: 38, padding: '2px 4px', width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)' }}
            />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            disabled={!draft.quote?.trim()}
            onClick={() => { onSave(index, draft); onClose(); }}
          >
            ✓ Save Changes
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
