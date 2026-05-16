export default function HistoryPanel({ history, onLoad, onDelete, onClear }) {
  if (!history.length) return null;

  function fmt(iso) {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="history-icon">🕐</span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Recent Batches</span>
          <span className="badge-count">{history.length}</span>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={onClear}>Clear all</button>
      </div>

      <div className="history-list">
        {history.map(entry => (
          <div key={entry.id} className="history-item">
            <div className="history-item-dot" style={{ background: entry.config.overlayColor || '#6366f1' }} />
            <div className="history-item-info">
              <span className="history-item-title">
                {entry.count} quote{entry.count !== 1 ? 's' : ''}
                {entry.config.theme && <span className="theme-tag" style={{ marginLeft: 6 }}>{entry.config.theme}</span>}
              </span>
              <span className="history-item-time">{fmt(entry.savedAt)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="btn btn-outline btn-xs" onClick={() => onLoad(entry)}>Load</button>
              <button className="btn btn-ghost btn-xs" style={{ color: 'var(--danger)' }}
                onClick={() => onDelete(entry.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
