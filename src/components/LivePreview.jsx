import { useEffect, useRef, useState } from 'react';
import { drawQuoteOnCanvas } from '../utils/canvasRenderer';
import { getCanvasSize } from '../utils/canvasSizes';
import { fetchThemeImage } from '../utils/imageLibrary';

const PLACEHOLDER = {
  quote: 'Your quote will appear here with the selected style.',
  author: 'Author Name',
};

export default function LivePreview({ config, sampleQuote }) {
  const canvasRef  = useRef();
  const [loading, setLoading] = useState(false);
  const bgRef      = useRef(null);
  const lastTheme  = useRef('');
  const lastBgType = useRef('');

  const quote = sampleQuote || PLACEHOLDER;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const { W, H } = getCanvasSize(config.size);
      const previewTheme = quote.theme || config.theme || 'nature';

      // Re-fetch only when theme or bgType changes
      const needNewBg =
        config.bgType === 'photo' &&
        (previewTheme !== lastTheme.current || lastBgType.current !== 'photo');

      if (needNewBg) {
        setLoading(true);
        const bg = await fetchThemeImage(previewTheme, 0, W);
        if (cancelled) return;
        bgRef.current = bg;
        lastTheme.current = previewTheme;
        lastBgType.current = 'photo';
        setLoading(false);
      } else if (config.bgType !== 'photo') {
        bgRef.current = null;
        lastBgType.current = config.bgType;
      }

      if (!canvasRef.current || cancelled) return;
      drawQuoteOnCanvas(canvasRef.current, quote, 0, { W, H, ...config }, bgRef.current);
    }

    render();
    return () => { cancelled = true; };
  }, [config, quote]);

  const { W, H } = getCanvasSize(config.size);
  const aspectRatio = `${W} / ${H}`;

  return (
    <div>
      <p className="config-sidebar-title">Live Preview</p>
      <div className="live-preview-wrap" style={{ aspectRatio }}>
        {loading && (
          <div className="live-preview-loading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'spin 0.8s linear infinite' }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
            </svg>
            Loading image…
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: loading ? 'none' : 'block' }} />
        <div className="live-preview-label">Preview · {W}×{H}</div>
      </div>
      {sampleQuote && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          Showing: <em>"{sampleQuote.quote.slice(0, 38)}…"</em>
        </p>
      )}
    </div>
  );
}
