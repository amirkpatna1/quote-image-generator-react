import { useEffect, useState } from 'react';
import { normalizeTheme, THEMES } from '../utils/quoteOptions';

const MODEL = 'claude-haiku-4-5-20251001';

const GENERATION_MODES = [
  {
    value: 'attributed',
    title: 'Attributed Quotes',
    description: 'Returns attributed quotes plus a source hint. Review before publishing.',
  },
  {
    value: 'original',
    title: 'Original Aphorisms',
    description: 'Creates fresh quote-style lines with no real-person attribution.',
  },
];

export default function AIQuoteGenerator({ onAdd, onClose }) {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('quotify-claude-key') || '');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(8);
  const [mode, setMode] = useState('attributed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (apiKey) sessionStorage.setItem('quotify-claude-key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function buildPrompt() {
    const themeList = THEMES.join(', ');

    if (mode === 'original') {
      return `Generate exactly ${count} original, concise, quote-style aphorisms about "${topic}".

Return ONLY a valid JSON array — no markdown, no explanation, no backticks.
Each element must have these exact fields:
- "quote": a fresh original line in a quote-like voice
- "author": an empty string
- "theme": one of these exact values: ${themeList}
- "source": an empty string
- "attribution_status": "original"

Rules:
- Do not quote or paraphrase any known public figure.
- Do not use attribution to a real person.
- Keep each quote under 26 words.
- Make each one distinct in idea and rhythm.`;
    }

    return `Generate exactly ${count} short, widely attributed quotes about "${topic}".

Return ONLY a valid JSON array — no markdown, no explanation, no backticks.
Each element must have these exact fields:
- "quote": the quote text
- "author": the attributed speaker's name
- "theme": one of these exact values: ${themeList}
- "source": a short source hint like a book, speech, essay, interview, or publication title
- "attribution_status": "attributed"

Rules:
- Use only quotes that are commonly attributed and broadly recognizable.
- If the wording or speaker is uncertain, skip it instead of inventing.
- Keep the wording concise.
- Do not fabricate source names.`;
  }

  function normalizePreviewItems(items) {
    return items
      .map((item) => ({
        quote: (item.quote || '').trim(),
        author: mode === 'original' ? '' : (item.author || '').trim(),
        theme: normalizeTheme(item.theme) || 'nature',
        source: mode === 'original' ? '' : (item.source || '').trim(),
        attribution_status: mode === 'original' ? 'original' : 'attributed',
      }))
      .filter((item) => item.quote);
  }

  async function generate() {
    if (!apiKey.trim()) {
      setError('Paste your Anthropic API key above.');
      return;
    }
    if (!topic.trim()) {
      setError('Enter a topic first.');
      return;
    }

    setError('');
    setLoading(true);
    setPreview([]);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Model returned unexpected format. Try again.');

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('No quotes returned.');

      const normalized = normalizePreviewItems(parsed);
      if (!normalized.length) throw new Error('No usable quotes returned. Try another topic.');

      setPreview(normalized);
    } catch (event) {
      setError(event.message);
    } finally {
      setLoading(false);
    }
  }

  function addAll() {
    preview.forEach((quote) => onAdd(quote));
    onClose();
  }

  function addOne(quote) {
    onAdd(quote);
  }

  const activeMode = GENERATION_MODES.find((item) => item.value === mode);

  return (
    <div className="ai-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="ai-modal">
        <div className="ai-modal-header">
          <div>
            <h3>✦ AI Quote Generator</h3>
            <p>Powered by Claude · choose attributed quotes or original aphorisms</p>
          </div>
          <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>✕</button>
        </div>

        <div className="ai-mode-tabs">
          {GENERATION_MODES.map((item) => (
            <button
              key={item.value}
              className={`ai-mode-tab ${mode === item.value ? 'active' : ''}`}
              onClick={() => {
                setMode(item.value);
                setPreview([]);
                setError('');
              }}
            >
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>

        <div className="ai-mode-note">
          {activeMode.description}
        </div>

        <div className="field" style={{ marginTop: 20 }}>
          <label>Anthropic API Key
            <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent-light)', marginLeft: 8, fontSize: '0.72rem' }}>
              Get one free →
            </a>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-ant-…"
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Stored in session only. Attributed mode adds a source hint so you can review before export.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginTop: 14 }}>
          <div className="field">
            <label>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. resilience, leadership, love, success…"
              onKeyDown={(event) => event.key === 'Enter' && generate()}
            />
          </div>
          <div className="field">
            <label>Count</label>
            <select value={count} onChange={(event) => setCount(Number(event.target.value))} style={{ width: 80 }}>
              {[5, 8, 10, 15, 20].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="ai-error">{error}</div>}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
          onClick={generate}
          disabled={loading || !topic.trim() || !apiKey.trim()}
        >
          {loading ? <><Spinner /> Generating with Claude…</> : `✦ Generate ${mode === 'original' ? 'Original' : 'Attributed'} Quotes`}
        </button>

        {preview.length > 0 && (
          <div className="ai-results">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block' }}>{preview.length} quotes generated</span>
                {mode === 'attributed' && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Review wording and source hints before publishing.
                  </span>
                )}
              </div>
              <button className="btn btn-success btn-sm" onClick={addAll}>+ Add All</button>
            </div>
            <div className="ai-quote-list">
              {preview.map((quote, index) => (
                <div key={index} className="ai-quote-item">
                  <div className="ai-quote-text">
                    <p>"{quote.quote}"</p>
                    <div className="ai-meta-line">
                      <span>{quote.author ? `— ${quote.author}` : 'Original line'}</span>
                      {quote.theme && <span className="theme-tag">{quote.theme}</span>}
                      <span className="status-pill ok">{quote.attribution_status}</span>
                    </div>
                    {quote.source && (
                      <span className="ai-source-line">Source hint: {quote.source}</span>
                    )}
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => addOne(quote)}>+ Add</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round"/>
    </svg>
  );
}
