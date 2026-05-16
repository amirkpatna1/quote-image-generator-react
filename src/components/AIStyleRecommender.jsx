import { useEffect, useState } from 'react';
import { generateStyleRecommendations } from '../utils/aiStyleGenerator';

export default function AIStyleRecommender({ quotes, currentConfig, onApply, onDismiss }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecommendation() {
      setLoading(true);
      setError('');
      const result = await generateStyleRecommendations(quotes);
      if (result) {
        setRecommendation(result);
      } else {
        setError('Could not analyze quotes');
      }
      setLoading(false);
    }
    fetchRecommendation();
  }, [quotes]);

  if (!loading && !recommendation) {
    return null;
  }

  const handleApply = () => {
    const updates = {
      theme: recommendation.theme,
      fontStyle: recommendation.fontStyle,
      layoutTemplate: recommendation.layoutTemplate,
      textColor: recommendation.text,
      overlayColor: recommendation.overlay,
      overlayOpacity: recommendation.opacity,
      bgType: 'photo',
    };
    onApply(updates);
  };

  return (
    <div className="ai-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onDismiss()}>
      <div className="ai-modal" style={{ maxWidth: 480 }}>
        <div className="ai-modal-header">
          <div>
            <h3>✨ AI Style Recommendation</h3>
            <p>Based on your quote sentiment</p>
          </div>
          <button className="modal-close-btn" onClick={onDismiss}>✕</button>
        </div>

        {loading && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div className="reel-recording-pulse" />
            <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Analyzing quotes…</p>
          </div>
        )}

        {!loading && recommendation && (
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '1.2rem', marginRight: 8 }}>🎨</span>
                <strong>Sentiment Detected</strong>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                {recommendation.reasoning}
              </p>
            </div>

            <div className="ai-mode-tabs" style={{ marginBottom: 20 }}>
              <div
                style={{
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Background</span>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {recommendation.theme.charAt(0).toUpperCase() + recommendation.theme.slice(1)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Font</span>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {recommendation.fontStyle.charAt(0).toUpperCase() + recommendation.fontStyle.slice(1)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Layout</span>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {recommendation.layoutTemplate
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Text Color</span>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: recommendation.text,
                          borderRadius: 4,
                          marginRight: 8,
                          border: '1px solid var(--border)',
                        }}
                      />
                      <code style={{ fontSize: '0.75rem' }}>{recommendation.text}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="btn-row" style={{ gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApply}>
                ✓ Apply Style
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onDismiss}>
                Skip
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={onDismiss}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
