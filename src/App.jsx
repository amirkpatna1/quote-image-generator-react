import { useEffect, useRef, useState } from 'react';
import Stepper from './components/Stepper';
import UploadCard from './components/UploadCard';
import ConfigCard from './components/ConfigCard';
import Gallery from './components/Gallery';
import Modal from './components/Modal';
import Toast from './components/Toast';
import AIStyleRecommender from './components/AIStyleRecommender';
import YouTubeAudioExtractor from './components/YouTubeAudioExtractor';
import VideoUploader from './components/VideoUploader';
import ImageSlideshow from './components/ImageSlideshow';
import MediaTimeline from './components/MediaTimeline';
import './styles/media-features.css';
import { fetchThemeImage, clearImageCache } from './utils/imageLibrary';
import { useHistory } from './hooks/useHistory';
import { useBrandKit } from './hooks/useBrandKit';
import { decodeShareLink, clearShareHash } from './utils/shareLink';

const DEFAULT_CONFIG = {
  bgType:             'photo',
  theme:              'nature',
  solidColor:         '#1a1a2e',
  gradientColor1:     '#1a1a2e',
  gradientColor2:     '#4a0080',
  gradientAngle:      135,
  overlayColor:       '#000000',
  overlayOpacity:     0.5,
  textColor:          '#ffffff',
  fontStyle:          'sans',
  layoutTemplate:     'classic',
  textAlign:          'center',
  fontSizeMultiplier: 1,
  filterPreset:       'none',
  size:               '800',
  logoPosition:       'bottom-right',
  logoOpacity:        0.85,
  logoSize:           0.1,
  activePreset:       null,
};

export default function App() {
  const [initialShared] = useState(() => {
    const shared = decodeShareLink();
    if (shared) clearShareHash();
    return shared;
  });
  const [step, setStep]                   = useState(1);
  const [quotes, setQuotes]               = useState(() => initialShared?.quotes || []);
  const [config, setConfig]               = useState(() => initialShared ? { ...DEFAULT_CONFIG, ...initialShared.config } : DEFAULT_CONFIG);
  const [bgImages, setBgImages]           = useState([]);
  const [logoImage, setLogoImage]         = useState(null);
  const [logoDataUrl, setLogoDataUrl]     = useState(null);
  const [variantOffsets, setVariantOffsets] = useState(() => Array(initialShared?.quotes.length || 0).fill(0).map((_, i) => i));
  const [progress, setProgress]           = useState({ generating: false, current: 0, total: 0, done: false });
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [showAiRecommender, setShowAiRecommender] = useState(false);
  const [toast, setToast]                 = useState(() => initialShared ? '✓ Shared batch loaded!' : '');
  const toastTimerRef = useRef(null);

  // New media features
  const [youtubeAudio, setYoutubeAudio] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [slideshowSettings, setSlideshowSettings] = useState({
    transitionEffect: 'fade',
    effectSettings: {},
  });
  const [mediaTimeline, setMediaTimeline] = useState({
    imageDuration: 4,
    videoDurations: {},
    totalDuration: 0,
  });

  const { history, saveEntry, removeEntry, clearHistory } = useHistory();
  const { brands, saveBrand, deleteBrand }               = useBrandKit();

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(msg) {
    setToast('');
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    requestAnimationFrame(() => {
      setToast(msg);
      toastTimerRef.current = setTimeout(() => setToast(''), 3200);
    });
  }

  function updateConfig(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function applyPreset(preset) {
    setConfig(prev => ({
      ...prev,
      overlayColor:   preset.overlayColor,
      overlayOpacity: preset.overlayOpacity,
      fontStyle:      preset.fontStyle,
      theme:          preset.theme,
      textColor:      preset.textColor,
      bgType:         'photo',
      activePreset:   preset.id,
    }));
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  async function generate(quoteList, offsets) {
    clearImageCache();
    const offs = offsets ?? Array(quoteList.length).fill(0).map((_, i) => i);
    setProgress({ generating: true, current: 0, total: quoteList.length, done: false });
    setBgImages([]);

    const images = [];
    for (let i = 0; i < quoteList.length; i++) {
      setProgress(p => ({ ...p, current: i + 1 }));
      let img = null;
      if (config.bgType === 'photo') {
        const theme = quoteList[i].theme || config.theme || 'nature';
        img = await fetchThemeImage(theme, offs[i] ?? i);
      }
      images.push(img ?? null);
    }

    setBgImages(images);
    setVariantOffsets(offs);
    setProgress({ generating: false, current: quoteList.length, total: quoteList.length, done: true });
    saveEntry(quoteList, config, offs);
    showToast(`✓ ${quoteList.length} images ready!`);
    setStep(3);
  }

  // ── Per-card new BG ───────────────────────────────────────────────────────
  async function regenerateSingle(index) {
    const newOffsets = [...variantOffsets];
    newOffsets[index] = (newOffsets[index] ?? 0) + 1;
    setVariantOffsets(newOffsets);
    const theme = quotes[index].theme || config.theme || 'nature';
    const img = config.bgType === 'photo' ? await fetchThemeImage(theme, newOffsets[index]) : null;
    setBgImages(prev => { const n = [...prev]; n[index] = img; return n; });
    showToast('New background loaded!');
  }

  // ── Picked specific image (ImagePicker) ───────────────────────────────────
  function handleBgImageSet(indexOrCmd, imgOrQuotes, newBgs) {
    if (indexOrCmd === '__reorder__') {
      setQuotes(imgOrQuotes);
      setBgImages(newBgs);
      return;
    }
    setBgImages(prev => { const n = [...prev]; n[indexOrCmd] = imgOrQuotes; return n; });
  }

  // ── Regenerate all ────────────────────────────────────────────────────────
  function handleRegenerateAll() {
    clearImageCache();
    setBgImages([]);
    setVariantOffsets(Array(quotes.length).fill(0));
    setProgress({ generating: false, current: 0, total: 0, done: false });
    setStep(2);
  }

  // ── Inline edit ───────────────────────────────────────────────────────────
  function handleEditQuote(index, updated) {
    const next = [...quotes];
    next[index] = updated;
    setQuotes(next);
    if (updated.theme !== quotes[index].theme && config.bgType === 'photo') {
      fetchThemeImage(updated.theme || config.theme, variantOffsets[index] ?? 0).then(img => {
        setBgImages(prev => { const n = [...prev]; n[index] = img; return n; });
      });
    }
  }

  function handleAddQuote(q) {
    setQuotes(prev => [...prev, q]);
    setVariantOffsets(prev => [...prev, 0]);
  }

  function handleNext(parsed) {
    setQuotes(parsed);
    setVariantOffsets(Array(parsed.length).fill(0).map((_, i) => i));
    setShowAiRecommender(true);
    setStep(2);
  }

  function handleApplyAiStyle(updates) {
    setConfig(prev => ({ ...prev, ...updates }));
    setShowAiRecommender(false);
    showToast('✨ AI style applied!');
  }

  // ── History ───────────────────────────────────────────────────────────────
  function handleLoadHistory(entry) {
    setConfig(prev => ({ ...prev, ...entry.config }));
    setVariantOffsets(entry.variantOffsets || Array(entry.quotes.length).fill(0));
    showToast('Batch loaded from history');
  }

  // ── Brand kit ─────────────────────────────────────────────────────────────
  function handleSaveBrand(name, cfg, dataUrl) {
    saveBrand(name, cfg, dataUrl || logoDataUrl);
    showToast(`Brand "${name}" saved!`);
  }

  function handleLoadBrand(brandConfig, brandLogoDataUrl) {
    setConfig(prev => ({ ...prev, ...brandConfig, activePreset: null }));
    if (brandLogoDataUrl) {
      const img = new Image();
      img.onload = () => { setLogoImage(img); setLogoDataUrl(brandLogoDataUrl); };
      img.src = brandLogoDataUrl;
    } else {
      setLogoImage(null);
      setLogoDataUrl(null);
    }
    showToast('Brand applied!');
  }

  function handleLogoUpload(img, dataUrl) {
    setLogoImage(img);
    setLogoDataUrl(dataUrl);
  }

  function handleLogoClear() {
    setLogoImage(null);
    setLogoDataUrl(null);
  }

  // Media feature handlers
  function handleAudioExtracted(audioData) {
    setYoutubeAudio(audioData);
    showToast(`✓ Audio extracted: ${audioData.title}`);
  }

  function handleVideosUploaded(videos) {
    setUploadedVideos(videos);
    showToast(`✓ ${videos.length} video(s) uploaded`);
  }

  function handleSlideshowChange(settings) {
    setSlideshowSettings(settings);
    showToast('✨ Slideshow effect updated');
  }

  function handleTimelineChange(timeline) {
    setMediaTimeline(timeline);
  }

  const configWithLogo = { ...config, logoImage: logoImage || undefined };
  const sampleQuote    = quotes[0] || null;

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">✦</div>
          <span className="header-title">Quotify</span>
          <span className="header-badge">Beta</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Free · No signup required</span>
      </header>

      {step === 1 && (
        <div className="hero">
          <div className="hero-eyebrow">✦ Quote Image Generator</div>
          <h1>Turn quotes into<br /><span>stunning visuals</span></h1>
          <p>Upload CSV, add quotes manually, or use AI — generate beautiful images with real photo backgrounds.</p>
          <div className="hero-stats">
            <div className="hero-stat"><strong>AI</strong><span>quote gen</span></div>
            <div className="hero-stat"><strong>14+</strong><span>themes</span></div>
            <div className="hero-stat"><strong>6</strong><span>sizes</span></div>
            <div className="hero-stat"><strong>🎬</strong><span>reel export</span></div>
          </div>
        </div>
      )}

      <main className="app-main">
        <Stepper current={step} />

        {step === 1 && (
          <UploadCard
            onNext={handleNext}
            onAddQuote={handleAddQuote}
            history={history}
            onLoadHistory={handleLoadHistory}
            onDeleteHistory={removeEntry}
            onClearHistory={clearHistory}
          />
        )}

        {step >= 2 && (
          <ConfigCard
            config={configWithLogo}
            onChange={updateConfig}
            onPreset={applyPreset}
            onGenerate={() => generate(quotes, variantOffsets)}
            onBack={() => setStep(1)}
            progress={progress}
            quoteCount={quotes.length}
            sampleQuote={sampleQuote}
            logoImage={logoImage}
            onLogoUpload={handleLogoUpload}
            onLogoClear={handleLogoClear}
            brands={brands}
            onSaveBrand={handleSaveBrand}
            onLoadBrand={handleLoadBrand}
            onDeleteBrand={deleteBrand}
          />
        )}

        {step === 3 && bgImages.length > 0 && (
          <>
            <Gallery
              quotes={quotes}
              config={configWithLogo}
              bgImages={bgImages}
              onPreview={setPreviewCanvas}
              onRegenerate={(idx) => idx !== undefined ? regenerateSingle(idx) : handleRegenerateAll()}
              onEditQuote={handleEditQuote}
              onPickImage={handleBgImageSet}
              onBgImageSet={handleBgImageSet}
              onToast={showToast}
              youtubeAudio={youtubeAudio}
              uploadedVideos={uploadedVideos}
              slideshowSettings={slideshowSettings}
              mediaTimeline={mediaTimeline}
            />

            {/* New Media Features */}
            <div className="media-features-section">
              <YouTubeAudioExtractor onAudioExtracted={handleAudioExtracted} />

              <VideoUploader onVideosUploaded={handleVideosUploaded} maxVideos={5} />

              {bgImages.length > 0 && (
                <ImageSlideshow
                  images={bgImages}
                  duration={mediaTimeline.imageDuration || 4}
                  transitionEffect={slideshowSettings.transitionEffect || 'fade'}
                  onSettingsChange={handleSlideshowChange}
                />
              )}

              {(youtubeAudio || uploadedVideos.length > 0 || bgImages.length > 0) && (
                <MediaTimeline
                  images={bgImages}
                  videos={uploadedVideos}
                  audio={youtubeAudio}
                  onTimelineChange={handleTimelineChange}
                />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="credits-bar">
        Photos from <a href="https://picsum.photos" target="_blank" rel="noreferrer">Picsum Photos</a>
        {' · '}AI by <a href="https://anthropic.com" target="_blank" rel="noreferrer">Claude</a>
        {' · '}Built with React + Canvas API
      </footer>

      {showAiRecommender && quotes.length > 0 && (
        <AIStyleRecommender
          quotes={quotes}
          currentConfig={config}
          onApply={handleApplyAiStyle}
          onDismiss={() => setShowAiRecommender(false)}
        />
      )}

      <Modal canvas={previewCanvas} onClose={() => setPreviewCanvas(null)} />
      <Toast message={toast} />
    </>
  );
}
