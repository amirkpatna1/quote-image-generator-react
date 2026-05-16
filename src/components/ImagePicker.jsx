import { useState, useEffect } from 'react';
import { THEME_SEEDS, loadImage } from '../utils/imageLibrary';

const THUMB = 200; // thumbnail size

function getThumbUrl(seed) {
  return `https://picsum.photos/seed/${seed}/${THUMB}/${THUMB}`;
}

export default function ImagePicker({ quoteIndex, quote, currentTheme, onPick, onClose }) {
  const [keyword,  setKeyword]  = useState(quote?.theme || currentTheme || 'nature');
  const [seeds,    setSeeds]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { buildSeeds(keyword); }, [keyword]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function buildSeeds(kw) {
    const key = kw.toLowerCase().trim();
    const base = THEME_SEEDS[key] || THEME_SEEDS['nature'];
    // Expand with suffixed variants to get 12 options
    const expanded = [];
    for (let i = 0; i < 12; i++) {
      const seed = base[i % base.length];
      expanded.push(i < base.length ? seed : `${seed}-${i}`);
    }
    setSeeds(expanded);
    setSelected(null);
  }

  function handleCustomKeyword(e) {
    e.preventDefault();
    buildSeeds(keyword);
  }

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    try {
      const url = `https://picsum.photos/seed/${selected}/1080/1080`;
      const img = await loadImage(url);
      onPick(quoteIndex, img, selected);
      onClose();
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const THEMES = Object.keys(THEME_SEEDS);

  return (
    <div className="ai-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ai-modal" style={{ maxWidth: 640 }}>
        <div className="ai-modal-header">
          <div>
            <h3>🖼 Pick Background</h3>
            <p>Quote #{quoteIndex + 1}{quote?.author ? ` · ${quote.author}` : ''}</p>
          </div>
          <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>✕</button>
        </div>

        {/* Keyword bar */}
        <form onSubmit={handleCustomKeyword} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input className="picker-search" type="text" value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search keyword… (mountain, city, ocean…)" />
          <button className="btn btn-ghost btn-sm" type="submit">Search</button>
        </form>

        {/* Theme chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {THEMES.map(t => (
            <button key={t}
              className={`preset-chip btn-xs ${keyword === t ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              onClick={() => setKeyword(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Thumbnail grid */}
        <div className="picker-grid" style={{ marginTop: 14 }}>
          {seeds.map(seed => (
            <div key={seed}
              className={`picker-thumb ${selected === seed ? 'selected' : ''}`}
              onClick={() => setSelected(seed)}>
              <img src={getThumbUrl(seed)} alt={seed} loading="lazy" />
              {selected === seed && <div className="picker-check">✓</div>}
            </div>
          ))}
        </div>

        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" disabled={!selected || loading} onClick={handleConfirm}>
            {loading ? 'Loading…' : 'Use this photo'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
