import { useRef } from 'react';
import { STYLE_PRESETS } from '../utils/imageLibrary';
import { FILTER_PRESETS } from '../utils/filters';
import { LAYOUT_TEMPLATES, THEMES } from '../utils/quoteOptions';
import LivePreview from './LivePreview';
import BrandKit from './BrandKit';

const FONT_OPTIONS = [
  { value: 'sans',   label: 'Sans',   family: '"Segoe UI", sans-serif', style: 'normal' },
  { value: 'serif',  label: 'Serif',  family: 'Georgia, serif',        style: 'normal' },
  { value: 'script', label: 'Script', family: 'Palatino, serif',       style: 'italic' },
];
const SIZE_OPTIONS = [
  { value: '800',       label: '800×800',   sub: 'Square',   w: 36, h: 36 },
  { value: '1080',      label: '1080×1080', sub: 'Instagram',w: 36, h: 36 },
  { value: '1080x1920', label: '1080×1920', sub: 'Story',    w: 22, h: 40 },
  { value: '800x1200',  label: '800×1200',  sub: 'Pinterest',w: 26, h: 40 },
  { value: '1200x630',  label: '1200×630',  sub: 'Twitter',  w: 40, h: 21 },
  { value: '1200x628',  label: '1200×628',  sub: 'LinkedIn', w: 40, h: 21 },
];

export default function ConfigCard({
  config, onChange, onPreset, onGenerate, onBack,
  progress, quoteCount, sampleQuote,
  logoImage, onLogoUpload, onLogoClear,
  brands, onSaveBrand, onLoadBrand, onDeleteBrand,
}) {
  const { generating, current, total, done } = progress;
  const pct     = total ? Math.round((current / total) * 100) : 0;
  const logoRef = useRef();

  function handleLogoFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => onLogoUpload(img, e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">🎨</div>
          <div><h2>Style Configuration</h2><p>Customize look &amp; feel — preview updates live</p></div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-light)', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 12px', borderRadius: 999 }}>
          {quoteCount} quote{quoteCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="config-layout">
        {/* ── Controls ── */}
        <div className="settings-sections">

          {/* Brand Kit */}
          <BrandKit
            brands={brands}
            config={config}
            logoImage={logoImage}
            onSave={onSaveBrand}
            onLoad={onLoadBrand}
            onDelete={onDeleteBrand}
          />

          <div className="divider" />

          {/* Quick Presets */}
          <div className="settings-section">
            <h3>Quick Presets</h3>
            <div className="preset-grid">
              {STYLE_PRESETS.map(p => (
                <button key={p.id} className={`preset-chip ${config.activePreset === p.id ? 'active' : ''}`}
                  onClick={() => onPreset(p)}>
                  <span>{p.emoji}</span>{p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="settings-section">
            <h3>Layout Template</h3>
            <div className="layout-template-grid">
              {LAYOUT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  className={`layout-template-card ${config.layoutTemplate === template.id ? 'active' : ''}`}
                  onClick={() => onChange('layoutTemplate', template.id)}
                >
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Background */}
          <div className="settings-section">
            <h3>Background</h3>
            <div className="bg-type-tabs" style={{ marginBottom: 14 }}>
              {[
                { value: 'photo',    label: '🌄 Photo'    },
                { value: 'gradient', label: '🎨 Gradient' },
                { value: 'solid',    label: '⬛ Solid'    },
              ].map(t => (
                <button key={t.value} className={`bg-type-tab ${config.bgType === t.value ? 'active' : ''}`}
                  onClick={() => { onChange('bgType', t.value); onChange('activePreset', null); }}>
                  {t.label}
                </button>
              ))}
            </div>

            {config.bgType === 'photo' && (
              <div className="field">
                <label>Photo Theme</label>
                <select value={config.theme} onChange={e => { onChange('theme', e.target.value); onChange('activePreset', null); }}>
                  {THEMES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            )}

            {config.bgType === 'solid' && (
              <div className="field">
                <label>Background Color</label>
                <input type="color" value={config.solidColor || '#1a1a2e'}
                  onChange={e => { onChange('solidColor', e.target.value); onChange('activePreset', null); }} />
              </div>
            )}

            {config.bgType === 'gradient' && (
              <>
                <div className="color-pair">
                  <div className="field" style={{ flex: 1 }}>
                    <label>Color 1</label>
                    <input type="color" value={config.gradientColor1 || '#1a1a2e'}
                      onChange={e => { onChange('gradientColor1', e.target.value); onChange('activePreset', null); }} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Color 2</label>
                    <input type="color" value={config.gradientColor2 || '#4a0080'}
                      onChange={e => { onChange('gradientColor2', e.target.value); onChange('activePreset', null); }} />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Angle — {config.gradientAngle || 135}°</label>
                  <div className="slider-row">
                    <input type="range" min="0" max="360" step="5" value={config.gradientAngle || 135}
                      onChange={e => onChange('gradientAngle', parseInt(e.target.value))} />
                    <span className="slider-val">{config.gradientAngle || 135}°</span>
                  </div>
                </div>
                <div className="gradient-preview" style={{
                  background: `linear-gradient(${config.gradientAngle || 135}deg, ${config.gradientColor1 || '#1a1a2e'}, ${config.gradientColor2 || '#4a0080'})`,
                  marginTop: 10,
                }} />
              </>
            )}
          </div>

          <div className="divider" />

          {/* Overlay */}
          <div className="settings-section">
            <h3>Overlay &amp; Tint</h3>
            <div className="settings-grid">
              <div className="field">
                <label>Overlay Color</label>
                <input type="color" value={config.overlayColor}
                  onChange={e => { onChange('overlayColor', e.target.value); onChange('activePreset', null); }} />
              </div>
              <div className="field">
                <label>Opacity — {Math.round(config.overlayOpacity * 100)}%</label>
                <div className="slider-row">
                  <input type="range" min="0.05" max="0.9" step="0.05" value={config.overlayOpacity}
                    onChange={e => onChange('overlayOpacity', parseFloat(e.target.value))} />
                  <span className="slider-val">{Math.round(config.overlayOpacity * 100)}%</span>
                </div>
              </div>
              <div className="field">
                <label>Text Color</label>
                <input type="color" value={config.textColor || '#ffffff'}
                  onChange={e => { onChange('textColor', e.target.value); onChange('activePreset', null); }} />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Typography */}
          <div className="settings-section">
            <h3>Typography</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {FONT_OPTIONS.map(f => (
                <button key={f.value} className={`preset-chip ${config.fontStyle === f.value ? 'active' : ''}`}
                  style={{ flexDirection: 'column', gap: 4, padding: '10px 18px' }}
                  onClick={() => { onChange('fontStyle', f.value); onChange('activePreset', null); }}>
                  <span style={{ fontSize: '1.5rem', fontFamily: f.family, fontStyle: f.style, fontWeight: 700, color: config.fontStyle === f.value ? 'var(--accent-light)' : 'var(--text)' }}>Aa</span>
                  <span style={{ fontSize: '0.72rem' }}>{f.label}</span>
                </button>
              ))}
            </div>
            <div className="field">
              <label>Text Alignment</label>
              <div className="align-group">
                {[
                  { value: 'left',   icon: <AlignLeft />   },
                  { value: 'center', icon: <AlignCenter /> },
                  { value: 'right',  icon: <AlignRight />  },
                ].map(a => (
                  <button key={a.value} className={`align-btn ${config.textAlign === a.value ? 'active' : ''}`}
                    title={a.value} onClick={() => onChange('textAlign', a.value)}>
                    {a.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Font Size — {Math.round((config.fontSizeMultiplier || 1) * 100)}%</label>
              <div className="slider-row">
                <input type="range" min="0.5" max="2" step="0.05" value={config.fontSizeMultiplier || 1}
                  onChange={e => onChange('fontSizeMultiplier', parseFloat(e.target.value))} />
                <span className="slider-val">{Math.round((config.fontSizeMultiplier || 1) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Filters */}
          <div className="settings-section">
            <h3>Photo Filter</h3>
            <div className="filter-grid">
              {FILTER_PRESETS.map(f => (
                <button key={f.id}
                  className={`filter-chip ${(config.filterPreset || 'none') === f.id ? 'active' : ''}`}
                  onClick={() => onChange('filterPreset', f.id)}>
                  <span className="filter-chip-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Output Size */}
          <div className="settings-section">
            <h3>Output Size</h3>
            <div className="size-options">
              {SIZE_OPTIONS.map(s => (
                <button key={s.value} className={`size-option ${config.size === s.value ? 'active' : ''}`}
                  onClick={() => onChange('size', s.value)}>
                  <div className="size-option-shape" style={{ width: s.w, height: s.h }} />
                  <span>{s.label}</span>
                  <small>{s.sub}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Logo */}
          <div className="settings-section">
            <h3>Logo / Watermark</h3>
            {!logoImage ? (
              <div className="logo-upload-zone" onClick={() => logoRef.current.click()}>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleLogoFile(e.target.files[0])} />
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>+ Upload PNG / SVG logo</p>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Stamped on every image</p>
              </div>
            ) : (
              <>
                <div className="logo-preview-wrap">
                  <img src={logoImage.src} className="logo-preview-img" alt="logo" />
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo uploaded</p>
                    <button className="btn btn-ghost btn-xs" style={{ marginTop: 6 }} onClick={onLogoClear}>Remove</button>
                  </div>
                </div>
                <div className="logo-controls">
                  <div className="field">
                    <label>Position</label>
                    <select value={config.logoPosition || 'bottom-right'} onChange={e => onChange('logoPosition', e.target.value)}>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Opacity — {Math.round((config.logoOpacity || 0.85) * 100)}%</label>
                    <div className="slider-row">
                      <input type="range" min="0.1" max="1" step="0.05" value={config.logoOpacity || 0.85}
                        onChange={e => onChange('logoOpacity', parseFloat(e.target.value))} />
                      <span className="slider-val">{Math.round((config.logoOpacity || 0.85) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="config-sidebar">
          <LivePreview config={config} sampleQuote={sampleQuote} />
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={onGenerate} disabled={generating}>
            {generating ? <><Spinner />{current}/{total} generating…</> : <><span>✦</span> Generate {quoteCount} Image{quoteCount !== 1 ? 's' : ''}</>}
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack} disabled={generating}>
            ← Back to Upload
          </button>
          {(generating || done) && (
            <div className="progress-wrap">
              <div className="progress-header">
                <span className="progress-label">{done ? 'All done!' : `${pct}% complete`}</span>
                <span className="progress-pct">{pct}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-steps" style={{ marginTop: 8 }}>
                {Array.from({ length: Math.min(total, 30) }).map((_, i) => (
                  <div key={i} className={`progress-dot ${i < current ? 'done' : ''}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlignLeft()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>; }
function AlignCenter() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>; }
function AlignRight()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>; }
function Spinner()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round"/></svg>; }
