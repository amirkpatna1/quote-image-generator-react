import { useEffect, useState } from 'react';
import {
  buildCarouselSlides,
  DEFAULT_CAROUSEL_OPTIONS,
  PLATFORM_PACKS,
  slugify,
} from '../utils/contentPacks';
import {
  downloadBlob,
  encodeSlidesToMp4,
  isMp4ExportSupported,
} from '../utils/mediaExport';
import { getCanvasSize } from '../utils/canvasSizes';
import MusicSelector from './MusicSelector';

export default function ReelExport({ quotes, config, bgImages, onClose }) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [mp4Blob, setMp4Blob] = useState(null);
  const [platformId, setPlatformId] = useState('instagram');
  const [sourceMode, setSourceMode] = useState('quotes');
  const [fps, setFps] = useState(30);
  const [duration, setDuration] = useState(4);
  const [title, setTitle] = useState(DEFAULT_CAROUSEL_OPTIONS.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.subtitle);
  const [cta, setCta] = useState(DEFAULT_CAROUSEL_OPTIONS.cta);
  const [ctaSubtitle, setCtaSubtitle] = useState(DEFAULT_CAROUSEL_OPTIONS.ctaSubtitle);
  const [limit, setLimit] = useState(Math.min(DEFAULT_CAROUSEL_OPTIONS.limit, quotes.length));
  const [error, setError] = useState('');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [musicFadeIn, setMusicFadeIn] = useState(0.5);
  const [musicFadeOut, setMusicFadeOut] = useState(0.5);

  const platform = PLATFORM_PACKS.find((item) => item.id === platformId) || PLATFORM_PACKS[0];
  const slides = sourceMode === 'carousel'
    ? buildCarouselSlides(quotes, {
        title,
        subtitle,
        cta,
        ctaSubtitle,
        limit,
        theme: config.theme,
      })
    : quotes.slice(0, Math.max(limit, 1));

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && status !== 'recording') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, status]);

  function resolveBgImage(slide, index) {
    const bgIndex = slide.backgroundIndex ?? index;
    return bgImages[bgIndex] ?? bgImages[0] ?? null;
  }

  async function startRecording() {
    setError('');
    setProgress(0);
    setMp4Blob(null);
    setStatus('recording');

    try {
      const totalDuration = slides.length * duration;
      const blob = await encodeSlidesToMp4({
        slides,
        baseConfig: config,
        size: platform.videoSize,
        fps,
        secondsPerSlide: duration,
        resolveBgImage,
        onProgress: setProgress,
        music: selectedMusic,
        musicVolume,
        musicFadeIn,
        musicFadeOut,
        videoDuration: totalDuration,
      });
      setMp4Blob(blob);
      setStatus('done');
    } catch (event) {
      setError(event.message || 'MP4 export failed.');
      setStatus('error');
    }
  }

  function downloadVideo() {
    if (!mp4Blob) return;
    downloadBlob(mp4Blob, `quotify-${platform.id}-${slugify(title || sourceMode)}.mp4`);
  }

  const { W, H } = getCanvasSize(platform.videoSize);

  return (
    <div className="ai-modal-backdrop" onClick={(event) => event.target === event.currentTarget && status !== 'recording' && onClose()}>
      <div className="ai-modal reel-export-modal">
        <div className="ai-modal-header">
          <div>
            <h3>🎬 Export MP4</h3>
            <p>Create a vertical MP4 for Instagram Reels, Facebook Reels, or YouTube Shorts.</p>
          </div>
          {status !== 'recording' && (
            <button className="modal-close-btn" style={{ position: 'static' }} onClick={onClose}>✕</button>
          )}
        </div>

        {status === 'idle' && (
          <>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Platform Preset</label>
              <select value={platformId} onChange={(event) => setPlatformId(event.target.value)}>
                {PLATFORM_PACKS.map((item) => (
                  <option key={item.id} value={item.id}>{item.videoLabel}</option>
                ))}
              </select>
            </div>

            <div className="ai-mode-tabs" style={{ marginTop: 14 }}>
              <button
                className={`ai-mode-tab ${sourceMode === 'quotes' ? 'active' : ''}`}
                onClick={() => setSourceMode('quotes')}
              >
                <strong>Quote Slideshow</strong>
                <span>Use the selected quote cards as vertical video slides.</span>
              </button>
              <button
                className={`ai-mode-tab ${sourceMode === 'carousel' ? 'active' : ''}`}
                onClick={() => setSourceMode('carousel')}
              >
                <strong>Carousel Storyboard</strong>
                <span>Add a hook cover and CTA ending for short-form video.</span>
              </button>
            </div>

            {sourceMode === 'carousel' && (
              <div className="carousel-builder-grid" style={{ marginTop: 16 }}>
                <div className="field">
                  <label>Hook Title</label>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Save these quotes" />
                </div>
                <div className="field">
                  <label>Hook Subtitle</label>
                  <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="A promise for the swipe" />
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
                  <label>CTA Slide</label>
                  <input value={cta} onChange={(event) => setCta(event.target.value)} placeholder="Follow for more" />
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>CTA Subline</label>
                  <input value={ctaSubtitle} onChange={(event) => setCtaSubtitle(event.target.value)} placeholder="Save and share this with someone who needs it" />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginTop: 18 }}>
              <div className="field">
                <label>Slides to include</label>
                <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
                  {Array.from({ length: quotes.length }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Seconds per slide</label>
                <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                  {[2, 3, 4, 5, 6, 8].map((value) => <option key={value} value={value}>{value}s</option>)}
                </select>
              </div>
              <div className="field">
                <label>Frame rate</label>
                <select value={fps} onChange={(event) => setFps(Number(event.target.value))}>
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                </select>
              </div>
            </div>

            <div className="reel-info">
              <div><span>Slides</span><strong>{slides.length}</strong></div>
              <div><span>Total duration</span><strong>{slides.length * duration}s</strong></div>
              <div><span>Resolution</span><strong>{W}×{H}</strong></div>
              <div><span>Format</span><strong>MP4 (H.264)</strong></div>
            </div>

            <MusicSelector
              selectedMusic={selectedMusic}
              onMusicSelect={setSelectedMusic}
              videoDuration={slides.length * duration}
              volume={musicVolume}
              onVolumeChange={setMusicVolume}
              fadeIn={musicFadeIn}
              onFadeInChange={setMusicFadeIn}
              fadeOut={musicFadeOut}
              onFadeOutChange={setMusicFadeOut}
            />

            {!isMp4ExportSupported() && (
              <div className="ai-error" style={{ marginTop: 14 }}>
                MP4 export needs WebCodecs support. Use a recent Chrome or Edge build.
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={startRecording}
              disabled={!isMp4ExportSupported()}
            >
              🎬 Build MP4
            </button>
          </>
        )}

        {status === 'recording' && (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div className="reel-recording-pulse" />
            <p style={{ fontWeight: 600, marginBottom: 10 }}>
              {progress < 50 ? 'Encoding video…' : 'Adding audio…'}
            </p>
            <div className="progress-bar-bg" style={{ margin: '0 auto', maxWidth: 320 }}>
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {progress}% · Do not close this window
            </p>
            {selectedMusic && progress >= 50 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: 12 }}>
                🎵 Muxing audio: {selectedMusic.name}
              </p>
            )}
          </div>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>MP4 ready!</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {slides.length} slides · {slides.length * duration}s · {W}×{H}
              {selectedMusic && ` · With audio 🎵`}
            </p>

            {selectedMusic && (
              <div style={{
                padding: 12,
                background: 'var(--success-bg)',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.8rem',
                textAlign: 'left',
                border: `1px solid var(--success)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ marginRight: 8, fontSize: '1.1rem' }}>✓</span>
                  <strong style={{ color: 'var(--success)' }}>Audio Successfully Added</strong>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>
                  "{selectedMusic.name}" has been muxed into your video with {Math.round(musicVolume * 100)}% volume
                  {(musicFadeIn > 0 || musicFadeOut > 0) && ` and fade effects`}.
                </p>
              </div>
            )}

            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-success" onClick={downloadVideo}>⬇ Download MP4</button>
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: 'var(--danger)' }}>{error || 'Encoding failed.'}</p>
            <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
