import { useEffect, useRef } from 'react';
import { drawQuoteOnCanvas } from '../utils/canvasRenderer';
import { getCanvasSize } from '../utils/canvasSizes';
import { formatAttributionStatus } from '../utils/quoteOptions';

export default function QuoteCard({
  quote, index, config, bgImage,
  onPreview, onDownload, onRegenerate, onEdit, onShare, onPickImage,
}) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;
    const { W, H } = getCanvasSize(config.size);
    drawQuoteOnCanvas(canvasRef.current, quote, index, { W, H, ...config }, bgImage);
  }, [quote, index, config, bgImage]);

  const { W, H } = getCanvasSize(config.size);

  return (
    <div className="quote-card">
      <div className="quote-card-canvas-wrap" style={{ aspectRatio: `${W} / ${H}` }}
        onClick={() => onPreview(canvasRef.current)}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div className="quote-card-overlay">
          <button className="btn btn-ghost btn-sm"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
            onClick={e => { e.stopPropagation(); onPreview(canvasRef.current); }}>
            <ExpandIcon /> Expand
          </button>
        </div>
      </div>
      <div className="quote-card-meta">
        <div className="quote-meta-text">
          <strong>{quote.quote.length > 52 ? quote.quote.slice(0, 52) + '…' : quote.quote}</strong>
          <span>
            {quote.author ? `— ${quote.author}` : quote.attribution_status === 'original' ? 'Original line' : 'Anonymous'}
          </span>
          <div className="quote-meta-tags">
            {quote.theme && <span className="theme-tag">{quote.theme}</span>}
            {quote.attribution_status && <span className="status-pill ok">{formatAttributionStatus(quote.attribution_status)}</span>}
          </div>
          {quote.source && (
            <span className="quote-meta-source">Source: {quote.source}</span>
          )}
        </div>
        <span className="quote-num">#{index + 1}</span>
      </div>
      <div className="card-actions-row">
        <button className="btn btn-ghost btn-xs" onClick={() => onDownload(canvasRef.current, index)}>
          <DownloadIcon /> Save
        </button>
        <button className="btn btn-ghost btn-xs" onClick={() => onRegenerate(index)}>
          <RegenIcon /> New BG
        </button>
        <button className="btn btn-ghost btn-xs" onClick={() => onPickImage(index)}>
          🖼 Pick BG
        </button>
        <button className="btn btn-ghost btn-xs" onClick={() => onEdit(index)}>
          <EditIcon /> Edit
        </button>
        {navigator.share && (
          <button className="btn btn-ghost btn-xs" onClick={() => onShare(canvasRef.current, quote)}>
            <ShareIcon /> Share
          </button>
        )}
      </div>
    </div>
  );
}

const sw = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round' };
function DownloadIcon() { return <svg {...sw}><path d="M12 15V3m0 12l-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>; }
function RegenIcon()    { return <svg {...sw}><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>; }
function EditIcon()     { return <svg {...sw}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function ShareIcon()    { return <svg {...sw}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }
function ExpandIcon()   { return <svg {...sw}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>; }
