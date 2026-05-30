import JSZip from 'jszip';
import { useState, useRef } from 'react';
import QuoteCard from './QuoteCard';
import QuoteEditor from './QuoteEditor';
import ImagePicker from './ImagePicker';
import CarouselBuilder from './CarouselBuilder';
import PlatformPackExport from './PlatformPackExport';
import ReelExport from './ReelExport';
import AdvancedMediaExport from './AdvancedMediaExport';
import { drawQuoteOnCanvas } from '../utils/canvasRenderer';
import { getCanvasSize } from '../utils/canvasSizes';
import { encodeShareLink } from '../utils/shareLink';

export default function Gallery({
  quotes, config, bgImages,
  onPreview, onRegenerate, onEditQuote, onPickImage, onToast,
  onBgImageSet,
  youtubeAudio,
  uploadedVideos,
  slideshowSettings,
  mediaTimeline,
}) {
  const [editIndex,  setEditIndex]  = useState(null);
  const [pickIndex,  setPickIndex]  = useState(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showPack,   setShowPack]   = useState(false);
  const [showReel,   setShowReel]   = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [dragIndex,  setDragIndex]  = useState(null);
  const [overIndex,  setOverIndex]  = useState(null);
  const dragOrder = useRef(null);

  // ── Downloads ────────────────────────────────────────────────────────────
  function downloadSingle(canvas, index) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `quotify-${String(index + 1).padStart(2, '0')}.png`;
    a.click();
    onToast('Image saved!');
  }

  async function shareImage(canvas, quote) {
    try {
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const file = new File([blob], 'quotify.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: quote.author ? `Quote by ${quote.author}` : 'Quote', text: quote.quote });
      } else {
        downloadSingle(canvas, 0);
        onToast('Downloaded (browser share not supported)');
      }
    } catch { /* user cancelled */ }
  }

  async function downloadAll() {
    onToast('Building ZIP…');
    const zip = new JSZip();
    const folder = zip.folder('quotify-images');
    const { W, H } = getCanvasSize(config.size);
    for (let i = 0; i < quotes.length; i++) {
      const c = document.createElement('canvas');
      drawQuoteOnCanvas(c, quotes[i], i, { W, H, ...config }, bgImages[i] ?? null);
      const b64 = c.toDataURL('image/png').split(',')[1];
      const label = (quotes[i].author || `quote-${i + 1}`).replace(/[^a-z0-9]/gi, '_').substring(0, 28);
      folder.file(`${String(i + 1).padStart(3, '0')}_${label}.png`, b64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quotify-images.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    onToast(`✓ ${quotes.length} images downloaded!`);
  }

  // ── Share link ────────────────────────────────────────────────────────────
  function copyShareLink() {
    const url = encodeShareLink(quotes, config);
    if (!url) { onToast('Could not generate link'); return; }
    navigator.clipboard?.writeText(url).then(() => onToast('Share link copied!')).catch(() => {
      prompt('Copy this link:', url);
    });
  }

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  function onDragStart(e, index) {
    setDragIndex(index);
    dragOrder.current = [...Array(quotes.length).keys()];
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }

  function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) { reset(); return; }
    onReorderQuotes(dragIndex, index);
    reset();
  }

  function reset() { setDragIndex(null); setOverIndex(null); }

  function onReorderQuotes(from, to) {
    const newQuotes = [...quotes];
    const newBgs    = [...bgImages];
    const [q] = newQuotes.splice(from, 1);
    const [b] = newBgs.splice(from, 1);
    newQuotes.splice(to, 0, q);
    newBgs.splice(to, 0, b);
    onPickImage('__reorder__', newQuotes, newBgs);
  }

  return (
    <div className="gallery-wrap">
      {/* Toolbar */}
      <div className="gallery-toolbar">
        <div className="gallery-info">
          <h2>Your Quote Images</h2>
          <p>{quotes.length} image{quotes.length !== 1 ? 's' : ''} · Drag cards to reorder · Click to expand</p>
        </div>
        <div className="gallery-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onRegenerate()}>
            <RegenIcon /> Regenerate All
          </button>
          <button className="btn btn-ghost btn-sm" onClick={copyShareLink} title="Copy shareable link">
            <ShareLinkIcon /> Share Link
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCarousel(true)}>
            🧵 Build Carousel
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPack(true)}>
            📦 Platform Pack
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowReel(true)}
            title="Basic MP4 export"
          >
            🎬 Export MP4
          </button>
          {(youtubeAudio || uploadedVideos.length > 0) && (
            <button 
              className="btn btn-accent btn-sm" 
              onClick={() => setShowAdvancedExport(true)}
              title="Advanced export with YouTube audio, videos, and effects"
            >
              ⚡ Advanced Export
            </button>
          )}
          <button className="btn btn-success" onClick={downloadAll}>
            <DownloadIcon /> Download All ZIP
          </button>
        </div>
      </div>

      {/* Grid with drag-to-reorder */}
      <div className="gallery-grid">
        {quotes.map((quote, i) => (
          <div
            key={i}
            draggable
            onDragStart={e => onDragStart(e, i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={e => onDrop(e, i)}
            onDragEnd={reset}
            style={{
              opacity: dragIndex === i ? 0.4 : 1,
              outline: overIndex === i && dragIndex !== i ? '2px solid var(--accent)' : 'none',
              borderRadius: 14, transition: 'opacity 0.15s',
            }}
          >
            <QuoteCard
              quote={quote}
              index={i}
              config={config}
              bgImage={bgImages[i] ?? null}
              onPreview={onPreview}
              onDownload={downloadSingle}
              onRegenerate={(idx) => onRegenerate(idx)}
              onEdit={(idx) => setEditIndex(idx)}
              onShare={shareImage}
              onPickImage={(idx) => setPickIndex(idx)}
            />
          </div>
        ))}
      </div>

      {/* Modals */}
      {editIndex !== null && (
        <QuoteEditor
          key={editIndex}
          quote={quotes[editIndex]}
          index={editIndex}
          onSave={(idx, updated) => { onEditQuote(idx, updated); onToast('Quote updated!'); }}
          onClose={() => setEditIndex(null)}
        />
      )}

      {pickIndex !== null && (
        <ImagePicker
          quoteIndex={pickIndex}
          quote={quotes[pickIndex]}
          currentTheme={config.theme}
          onPick={(idx, img) => { onBgImageSet(idx, img); onToast('Background updated!'); }}
          onClose={() => setPickIndex(null)}
        />
      )}

      {showReel && (
        <ReelExport
          quotes={quotes}
          config={config}
          bgImages={bgImages}
          onClose={() => setShowReel(false)}
        />
      )}

      {showCarousel && (
        <CarouselBuilder
          quotes={quotes}
          config={config}
          bgImages={bgImages}
          onClose={() => setShowCarousel(false)}
          onToast={onToast}
        />
      )}

      {showPack && (
        <PlatformPackExport
          quotes={quotes}
          config={config}
          bgImages={bgImages}
          onClose={() => setShowPack(false)}
          onToast={onToast}
        />
      )}

      {showAdvancedExport && (
        <AdvancedMediaExport
          quotes={quotes}
          config={config}
          bgImages={bgImages}
          youtubeAudio={youtubeAudio}
          uploadedVideos={uploadedVideos}
          slideshowSettings={slideshowSettings}
          mediaTimeline={mediaTimeline}
          onClose={() => setShowAdvancedExport(false)}
        />
      )}
    </div>
  );
}

function DownloadIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>; }
function RegenIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>; }
function ShareLinkIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }
