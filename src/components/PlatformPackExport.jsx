import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import {
  buildCarouselSlides,
  DEFAULT_CAROUSEL_OPTIONS,
  PLATFORM_PACKS,
  slugify,
} from '../utils/contentPacks';
import {
  canvasToBlob,
  downloadBlob,
  renderSlideCanvas,
} from '../utils/mediaExport';

const DEFAULT_SELECTION = Object.fromEntries(PLATFORM_PACKS.map((platform) => [platform.id, true]));

export default function PlatformPackExport({ quotes, config, bgImages, onClose, onToast }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(DEFAULT_SELECTION);
  const [title, setTitle] = useState(DEFAULT_CAROUSEL_OPTIONS.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.subtitle);
  const [cta, setCta] = useState(DEFAULT_CAROUSEL_OPTIONS.cta);
  const [ctaSubtitle, setCtaSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.ctaSubtitle);
  const [limit, setLimit] = useState(Math.min(DEFAULT_CAROUSEL_OPTIONS.limit, quotes.length));
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !exporting) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [exporting, onClose]);

  const activePlatforms = PLATFORM_PACKS.filter((platform) => selectedPlatforms[platform.id]);
  const carouselSlides = buildCarouselSlides(quotes, {
    title,
    subtitle,
    cta,
    ctaSubtitle,
    limit,
    theme: config.theme,
  });

  function togglePlatform(platformId) {
    setSelectedPlatforms((current) => ({ ...current, [platformId]: !current[platformId] }));
  }

  function resolveBgImage(slide) {
    const bgIndex = slide.backgroundIndex ?? 0;
    return bgImages[bgIndex] ?? bgImages[0] ?? null;
  }

  function getAssetEntries(platform) {
    return platform.exports.flatMap((item) => {
      if (item.mode === 'quotes') {
        return quotes.map((quote, index) => ({
          exportItem: item,
          slide: quote,
          slideIndex: index,
          fileName: `${String(index + 1).padStart(2, '0')}-${slugify(quote.author || quote.quote)}.png`,
        }));
      }

      if (item.mode === 'carousel') {
        return carouselSlides.map((slide, index) => ({
          exportItem: item,
          slide,
          slideIndex: index,
          fileName: `${String(index + 1).padStart(2, '0')}-${slide.slide_role}.png`,
        }));
      }

      return [{
        exportItem: item,
        slide: carouselSlides[0],
        slideIndex: 0,
        fileName: `${platform.id}-${item.id}.png`,
      }];
    });
  }

  async function exportPack() {
    if (!activePlatforms.length) {
      onToast('Pick at least one platform');
      return;
    }

    setExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const manifest = ['Quotify Platform Pack', `Quotes: ${quotes.length}`, ''];
      const totalAssets = activePlatforms.reduce((sum, platform) => sum + getAssetEntries(platform).length, 0);
      let processed = 0;

      for (const platform of activePlatforms) {
        const platformFolder = zip.folder(platform.id);
        manifest.push(`${platform.name}`);

        for (const entry of getAssetEntries(platform)) {
          const targetFolder = platformFolder.folder(entry.exportItem.folder);
          const canvas = renderSlideCanvas(
            entry.slide,
            entry.slideIndex,
            config,
            entry.exportItem.size,
            resolveBgImage(entry.slide),
          );
          const blob = await canvasToBlob(canvas);
          targetFolder.file(entry.fileName, blob);
          processed += 1;
          setProgress(Math.round((processed / totalAssets) * 100));
        }

        platformFolder.file(
          'README.txt',
          [
            `${platform.name} Pack`,
            `Feed/story assets exported from ${quotes.length} quotes`,
            `Carousel slides: ${carouselSlides.length}`,
          ].join('\n'),
        );
        manifest.push(`- ${platform.exports.map((item) => item.label).join(', ')}`);
      }

      zip.file(
        'README.txt',
        [
          ...manifest,
          '',
          `Carousel title: ${title || 'Auto-generated'}`,
          `CTA: ${cta}`,
        ].join('\n'),
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, `quotify-platform-pack-${slugify(title || 'content-pack')}.zip`);
      onToast(`✓ Platform pack ready for ${activePlatforms.length} platform${activePlatforms.length !== 1 ? 's' : ''}`);
      onClose();
    } catch {
      onToast('Could not build the platform pack');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  }

  return (
    <div className="ai-modal-backdrop" onClick={(event) => event.target === event.currentTarget && !exporting && onClose()}>
      <div className="ai-modal platform-pack-modal">
        <div className="ai-modal-header">
          <div>
            <h3>📦 Platform Pack Export</h3>
            <p>Generate feed posts, stories, carousel slides, covers, and thumbnails in one ZIP.</p>
          </div>
          {!exporting && (
            <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>✕</button>
          )}
        </div>

        <div className="platform-pack-grid">
          {PLATFORM_PACKS.map((platform) => (
            <button
              key={platform.id}
              className={`platform-pack-card ${selectedPlatforms[platform.id] ? 'active' : ''}`}
              onClick={() => togglePlatform(platform.id)}
            >
              <strong>{platform.name}</strong>
              <span>{platform.description}</span>
              <small>{platform.exports.map((item) => item.label).join(' · ')}</small>
            </button>
          ))}
        </div>

        <div className="carousel-builder-grid" style={{ marginTop: 18 }}>
          <div className="field">
            <label>Carousel Hook</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={`Save these ${Math.min(limit, quotes.length)} quotes`}
            />
          </div>
          <div className="field">
            <label>Carousel Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Why people should keep swiping"
            />
          </div>
          <div className="field">
            <label>Carousel Quote Slides</label>
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              {Array.from({ length: quotes.length }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value}</option>
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
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>CTA Subline</label>
            <input
              type="text"
              value={ctaSubtitle}
              onChange={(event) => setCtaSubtitle(event.target.value)}
              placeholder="Save and share this with someone who needs it"
            />
          </div>
        </div>

        <div className="reel-info" style={{ marginTop: 18 }}>
          <div><span>Selected platforms</span><strong>{activePlatforms.length}</strong></div>
          <div><span>Quote assets</span><strong>{quotes.length} per feed export</strong></div>
          <div><span>Carousel slides</span><strong>{carouselSlides.length}</strong></div>
          <div><span>ZIP contents</span><strong>PNG folders + READMEs</strong></div>
        </div>

        {exporting && (
          <div className="progress-wrap" style={{ marginTop: 16 }}>
            <div className="progress-header">
              <span className="progress-label">Building platform pack…</span>
              <span className="progress-pct">{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" disabled={exporting} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={exporting} onClick={exportPack}>
            {exporting ? 'Packaging…' : '⬇ Export Platform Pack'}
          </button>
        </div>
      </div>
    </div>
  );
}
