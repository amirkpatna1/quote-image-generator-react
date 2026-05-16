import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import {
  buildCarouselSlides,
  DEFAULT_CAROUSEL_OPTIONS,
  slugify,
} from '../utils/contentPacks';
import {
  canvasToBlob,
  downloadBlob,
  renderSlideCanvas,
} from '../utils/mediaExport';

const FORMAT_OPTIONS = [
  { value: '1080', label: '1080×1080', description: 'Square carousel for Instagram and Facebook.' },
  { value: '1080x1350', label: '1080×1350', description: 'Portrait feed slides with more room for copy.' },
  { value: '1200x630', label: '1200×630', description: 'Landscape slides for wide social placements.' },
  { value: '1080x1920', label: '1080×1920', description: 'Vertical slides for story-style sequences.' },
];

export default function CarouselBuilder({ quotes, config, bgImages, onClose, onToast }) {
  const [title, setTitle] = useState(DEFAULT_CAROUSEL_OPTIONS.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.subtitle);
  const [cta, setCta] = useState(DEFAULT_CAROUSEL_OPTIONS.cta);
  const [ctaSubtitle, setCtaSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.ctaSubtitle);
  const [limit, setLimit] = useState(Math.min(DEFAULT_CAROUSEL_OPTIONS.limit, quotes.length));
  const [format, setFormat] = useState('1080');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !downloading) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [downloading, onClose]);

  const slides = buildCarouselSlides(quotes, {
    title,
    subtitle,
    cta,
    ctaSubtitle,
    limit,
    theme: config.theme,
  });

  function resolveBgImage(slide) {
    const bgIndex = slide.backgroundIndex ?? 0;
    return bgImages[bgIndex] ?? bgImages[0] ?? null;
  }

  async function downloadCarouselZip() {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('carousel');

      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index];
        const canvas = renderSlideCanvas(slide, index, config, format, resolveBgImage(slide));
        const blob = await canvasToBlob(canvas);
        const fileLabel = slide.slide_role === 'quote'
          ? `${String(index + 1).padStart(2, '0')}-${slugify(slide.author || slide.quote)}.png`
          : `${String(index + 1).padStart(2, '0')}-${slide.slide_role}.png`;
        folder.file(fileLabel, blob);
      }

      folder.file(
        'README.txt',
        [
          'Quotify Carousel Pack',
          `Slides: ${slides.length}`,
          `Format: ${format}`,
          `Title: ${title || 'Auto-generated'}`,
          `CTA: ${cta}`,
        ].join('\n'),
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, `quotify-carousel-${slugify(title || 'series')}.zip`);
      onToast(`✓ Carousel pack ready with ${slides.length} slides`);
      onClose();
    } catch {
      onToast('Could not build the carousel pack');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="ai-modal-backdrop" onClick={(event) => event.target === event.currentTarget && !downloading && onClose()}>
      <div className="ai-modal carousel-modal">
        <div className="ai-modal-header">
          <div>
            <h3>🧵 Carousel Builder</h3>
            <p>Create a hook slide, quote sequence, and CTA ending from this batch.</p>
          </div>
          {!downloading && (
            <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>✕</button>
          )}
        </div>

        <div className="carousel-builder-grid">
          <div className="field">
            <label>Hook Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={`Save these ${Math.min(limit, quotes.length)} quotes`}
            />
          </div>
          <div className="field">
            <label>Cover Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="A short promise for the swipe"
            />
          </div>
          <div className="field">
            <label>Quote Slides</label>
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              {Array.from({ length: quotes.length }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Output Format</label>
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              {FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>CTA Slide</label>
            <input
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="Follow for more"
            />
          </div>
          <div className="field">
            <label>CTA Subline</label>
            <input
              type="text"
              value={ctaSubtitle}
              onChange={(event) => setCtaSubtitle(event.target.value)}
              placeholder="Save and share this post"
            />
          </div>
        </div>

        <div className="carousel-format-note">
          {FORMAT_OPTIONS.find((option) => option.value === format)?.description}
        </div>

        <div className="carousel-preview-panel">
          <div className="carousel-preview-header">
            <strong>{slides.length} slides</strong>
            <span>{limit} quote slide{limit !== 1 ? 's' : ''} + cover + CTA</span>
          </div>
          <div className="carousel-preview-list">
            {slides.map((slide, index) => (
              <div key={`${slide.slide_role}-${index}`} className="carousel-preview-item">
                <span className="quote-num">#{index + 1}</span>
                <div>
                  <strong>{slide.slide_role === 'quote' ? slide.quote : slide.slide_role.toUpperCase()}</strong>
                  <p>{slide.slide_role === 'quote' ? (slide.author || slide.source || 'Quote slide') : slide.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" disabled={downloading} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={downloading} onClick={downloadCarouselZip}>
            {downloading ? 'Building Carousel…' : '⬇ Download Carousel ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
}
