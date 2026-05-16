import { useState } from 'react';
import {
  ATTRIBUTION_STATUSES,
  FONT_STYLES,
  THEMES,
} from '../utils/quoteOptions';

const BLANK = {
  quote: '',
  author: '',
  theme: '',
  font_style: '',
  overlay_color: '',
  source: '',
  attribution_status: '',
};

export default function AddQuoteForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function handleAdd() {
    if (!form.quote.trim()) {
      setError('Quote text is required.');
      return;
    }
    onAdd({ ...form });
    setForm({ ...BLANK });
    setOpen(false);
  }

  return (
    <div className="add-quote-section">
      <button className="add-quote-toggle" onClick={() => setOpen((current) => !current)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {open ? 'Cancel' : 'Add a Quote Manually'}
      </button>

      {open && (
        <div className="add-quote-form">
          <div>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
              Quote Text *
            </label>
            <textarea
              value={form.quote}
              onChange={(event) => set('quote', event.target.value)}
              placeholder="Type or paste your quote here…"
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.76rem', marginTop: 4 }}>{error}</p>}
          </div>

          <div className="add-quote-row">
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(event) => set('author', event.target.value)}
                placeholder="e.g. Steve Jobs"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Theme</label>
              <select value={form.theme} onChange={(event) => set('theme', event.target.value)}>
                <option value="">— Global default —</option>
                {THEMES.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Font Style</label>
              <select value={form.font_style} onChange={(event) => set('font_style', event.target.value)}>
                <option value="">— Global default —</option>
                {FONT_STYLES.map((fontStyle) => <option key={fontStyle} value={fontStyle}>{fontStyle}</option>)}
              </select>
            </div>
          </div>

          <div className="add-quote-row add-quote-row-double">
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Source</label>
              <input
                type="text"
                value={form.source}
                onChange={(event) => set('source', event.target.value)}
                placeholder="Book, speech, article…"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Attribution</label>
              <select value={form.attribution_status} onChange={(event) => set('attribution_status', event.target.value)}>
                <option value="">— Optional —</option>
                {ATTRIBUTION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>
              + Add Quote
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setForm({ ...BLANK }); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
