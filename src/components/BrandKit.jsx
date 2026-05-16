import { useState } from 'react';

export default function BrandKit({ brands, config, logoImage, onSave, onLoad, onDelete }) {
  const [saving, setSaving] = useState(false);
  const [name, setName]     = useState('');

  function handleSave() {
    if (!name.trim()) return;
    const logoDataUrl = logoImage?.src || null;
    onSave(name.trim(), config, logoDataUrl);
    setName('');
    setSaving(false);
  }

  function handleLoad(brand) {
    onLoad(brand.config, brand.logoDataUrl);
  }

  return (
    <div className="brand-kit">
      <div className="brand-kit-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🏷️</span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Brand Kit</span>
          {brands.length > 0 && <span className="badge-count">{brands.length}</span>}
        </div>
        <button className="btn btn-ghost btn-xs"
          onClick={() => setSaving(s => !s)}>
          {saving ? 'Cancel' : '+ Save current'}
        </button>
      </div>

      {saving && (
        <div className="brand-save-form">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Brand name (e.g. My Company)"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button className="btn btn-primary btn-xs" disabled={!name.trim()} onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {brands.length > 0 && (
        <div className="brand-list">
          {brands.map(brand => (
            <div key={brand.id} className="brand-item">
              {brand.logoDataUrl
                ? <img src={brand.logoDataUrl} className="brand-logo" alt={brand.name} />
                : <div className="brand-logo-placeholder"
                    style={{ background: brand.config.overlayColor || '#6366f1' }}>
                    {brand.name[0].toUpperCase()}
                  </div>}
              <div className="brand-item-info">
                <span className="brand-item-name">{brand.name}</span>
                <span className="brand-item-meta">
                  {brand.config.fontStyle} · {brand.config.bgType}
                  {brand.config.layoutTemplate ? ` · ${brand.config.layoutTemplate}` : ''}
                  {brand.config.theme ? ` · ${brand.config.theme}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <button className="btn btn-outline btn-xs" onClick={() => handleLoad(brand)}>Apply</button>
                <button className="btn btn-ghost btn-xs" style={{ color: 'var(--danger)' }}
                  onClick={() => onDelete(brand.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {brands.length === 0 && !saving && (
        <p className="brand-empty">Save your current style as a brand to reuse it across sessions.</p>
      )}
    </div>
  );
}
