import React, { useState, useMemo } from 'react';
import '../styles/CompositionAndDesign.css';

/**
 * STEP 2: COMPOSITION & TIMING
 * Arrange media, sync duration, and design quotes
 */

const SLIDESHOW_EFFECTS = [
  {
    id: 'fade',
    name: 'Fade',
    icon: '✨',
    description: 'Smooth fade transition between quotes',
    duration: 0.5,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '🔍',
    description: 'Zoom in/out effect',
    duration: 0.8,
    params: { zoomLevel: 1.2, minValue: 1, maxValue: 2 },
  },
  {
    id: 'pan',
    name: 'Pan',
    icon: '↔️',
    description: 'Pan across the image',
    duration: 0.8,
    params: { panSpeed: 20, minValue: 10, maxValue: 50 },
  },
  {
    id: 'rotate',
    name: 'Rotate',
    icon: '🔄',
    description: 'Rotate background image',
    duration: 0.8,
    params: { degrees: 5, minValue: 1, maxValue: 45 },
  },
  {
    id: 'blur-to-focus',
    name: 'Blur-to-Focus',
    icon: '🎯',
    description: 'Blur effect that sharpens',
    duration: 1.2,
    params: { blurAmount: 20, minValue: 5, maxValue: 50 },
  },
  {
    id: 'flip',
    name: 'Flip',
    icon: '↕️',
    description: 'Flip transition effect',
    duration: 0.6,
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    icon: '←',
    description: 'Slide from right to left',
    duration: 0.6,
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    icon: '→',
    description: 'Slide from left to right',
    duration: 0.6,
  },
];

export default function CompositionAndDesign({
  mediaConfig,
  onComplete,
  onBack,
}) {
  const { quotes, audioMetadata, useVideos, useCustomImages } = mediaConfig;
  const [step, setStep] = useState('timing'); // 'timing' or 'design'
  const [imageDuration, setImageDuration] = useState(4);
  const [config, setConfig] = useState({
    theme: 'nature',
    bgType: 'photo',
    textColor: '#ffffff',
    overlayOpacity: 0.5,
    fontStyle: 'sans',
    layoutTemplate: 'classic',
    slideshowEffect: 'fade',
    effectParams: {},
  });
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState('fade');

  // Calculate durations
  const contentDuration = useMemo(() => {
    let duration = quotes.length * imageDuration;
    if (useVideos && videos.length > 0) {
      duration += videos.reduce((sum, v) => sum + (v.duration || 0), 0);
    }
    return duration;
  }, [quotes.length, imageDuration, useVideos, videos]);

  const audioDuration = audioMetadata?.duration || 0;

  // Duration mismatch analysis
  const durationAnalysis = useMemo(() => {
    if (audioDuration === 0) {
      return {
        hasAudio: false,
        matches: true,
        mismatch: 0,
        ratio: 1,
      };
    }

    const diff = audioDuration - contentDuration;
    const ratio = audioDuration / contentDuration;

    return {
      hasAudio: true,
      matches: Math.abs(diff) < 1,
      mismatch: Math.abs(diff),
      ratio,
      needsExtension: diff > 0,
    };
  }, [audioDuration, contentDuration]);

  const handleAutoSync = () => {
    if (durationAnalysis.ratio && durationAnalysis.ratio !== 1) {
      setImageDuration(imageDuration * durationAnalysis.ratio);
      
      const scaledVideos = videos.map(v => ({
        ...v,
        duration: (v.duration || 0) * durationAnalysis.ratio,
      }));
      setVideos(scaledVideos);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      alert('File too large (max 500MB)');
      return;
    }

    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      const newVideo = {
        id: Date.now(),
        name: file.name,
        file,
        duration: Math.floor(video.duration),
      };
      setVideos([...videos, newVideo]);
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const moveVideo = (index, direction) => {
    const newVideos = [...videos];
    if (direction === 'up' && index > 0) {
      [newVideos[index], newVideos[index - 1]] = [newVideos[index - 1], newVideos[index]];
    } else if (direction === 'down' && index < newVideos.length - 1) {
      [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    }
    setVideos(newVideos);
  };

  const handleComplete = () => {
    const composition = {
      ...mediaConfig,
      imageDuration,
      videos,
      config,
    };
    onComplete(composition);
  };

  return (
    <div className="composition-container">
      {/* TABS */}
      <div className="composition-tabs">
        <button
          className={`tab ${step === 'timing' ? 'active' : ''}`}
          onClick={() => setStep('timing')}
        >
          ⏱️ Composition & Timing
        </button>
        <button
          className={`tab ${step === 'design' ? 'active' : ''}`}
          onClick={() => setStep('design')}
          disabled={contentDuration === 0}
        >
          🎨 Design & Effects
        </button>
      </div>

      {/* TIMING TAB */}
      {step === 'timing' && (
        <div className="tab-content">
          <h2>Composition & Timing</h2>

          {/* DURATION ANALYSIS */}
          <section className="analysis-section">
            <h3>⏱️ Duration Analysis</h3>

            <div className="duration-display">
              <div className="duration-box audio">
                <span className="label">🎵 Audio Duration</span>
                <span className="time">
                  {durationAnalysis.hasAudio
                    ? formatTime(audioDuration)
                    : 'No audio'}
                </span>
              </div>

              <div className="duration-box content">
                <span className="label">📊 Content Duration</span>
                <span className="time">{formatTime(contentDuration)}</span>
              </div>

              <div className={`duration-box status ${durationAnalysis.matches ? 'match' : 'mismatch'}`}>
                <span className="label">⚖️ Status</span>
                <span className="time">
                  {durationAnalysis.matches ? (
                    '✓ Perfect Match'
                  ) : (
                    <>
                      {durationAnalysis.needsExtension ? '⬆️ Extend' : '⬇️ Trim'}
                      {' '}
                      {formatTime(durationAnalysis.mismatch)}
                    </>
                  )}
                </span>
              </div>
            </div>

            {!durationAnalysis.matches && durationAnalysis.hasAudio && (
              <div className="mismatch-warning">
                <p>
                  {durationAnalysis.needsExtension
                    ? `⚠️ Content is ${formatTime(durationAnalysis.mismatch)} shorter than audio`
                    : `⚠️ Content is ${formatTime(durationAnalysis.mismatch)} longer than audio`}
                </p>
                <button className="btn btn-primary" onClick={handleAutoSync}>
                  ✨ Auto-Sync to Audio
                </button>
                <small>
                  Will adjust timing proportionally to match audio duration
                </small>
              </div>
            )}
          </section>

          {/* QUOTE TIMING */}
          <section className="timing-section">
            <h3>🖼️ Quote Image Timing</h3>
            <div className="timing-control">
              <label>
                <span>Time per quote:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={imageDuration}
                  onChange={(e) => setImageDuration(parseFloat(e.target.value))}
                />
                <span className="value">{imageDuration.toFixed(1)}s</span>
              </label>
              <p className="calculation">
                {quotes.length} images × {imageDuration.toFixed(1)}s = {(quotes.length * imageDuration).toFixed(0)}s
              </p>
            </div>
          </section>

          {/* VIDEO UPLOAD */}
          {useVideos && (
            <section className="videos-section">
              <h3>🎬 Video Clips</h3>
              <p className="section-description">
                Add videos to play between quotes (intro/outro/transitions)
              </p>

              <div className="video-upload-box">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                  />
                  📁 Click to upload or drag & drop
                </label>
                <small>MP4, WebM, MOV, etc. • Max 500MB each</small>
              </div>

              {videos.length > 0 && (
                <div className="videos-list">
                  <h4>Uploaded Videos ({videos.length})</h4>
                  {videos.map((video, idx) => (
                    <div key={video.id} className="video-item">
                      <span className="video-name">{video.name}</span>
                      <span className="video-duration">
                        {formatTime(video.duration)}
                      </span>
                      <div className="video-controls">
                        {idx > 0 && (
                          <button
                            onClick={() => moveVideo(idx, 'up')}
                            title="Move up"
                            className="control-btn"
                          >
                            ↑
                          </button>
                        )}
                        {idx < videos.length - 1 && (
                          <button
                            onClick={() => moveVideo(idx, 'down')}
                            title="Move down"
                            className="control-btn"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => removeVideo(video.id)}
                          title="Remove"
                          className="control-btn remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TIMELINE VISUALIZATION */}
          <section className="timeline-section">
            <h3>📊 Timeline Preview</h3>
            <div className="timeline">
              <div className="timeline-track audio-track">
                <span className="track-label">Audio</span>
                <div
                  className="track-bar"
                  style={{
                    width: `${Math.min((audioDuration / Math.max(audioDuration, contentDuration)) * 100, 100)}%`,
                  }}
                >
                  {audioDuration > 0 && formatTime(audioDuration)}
                </div>
              </div>
              <div className="timeline-track content-track">
                <span className="track-label">Content</span>
                <div
                  className="track-bar"
                  style={{
                    width: `${Math.min((contentDuration / Math.max(audioDuration, contentDuration)) * 100, 100)}%`,
                  }}
                >
                  {formatTime(contentDuration)}
                </div>
              </div>
            </div>
          </section>

          <div className="composition-actions">
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setStep('design')}
              disabled={contentDuration === 0}
            >
              Next: Design & Effects →
            </button>
          </div>
        </div>
      )}

      {/* DESIGN TAB */}
      {step === 'design' && (
        <div className="tab-content">
          <h2>Design & Effects</h2>

          <section className="design-section">
            <h3>🎨 Quote Styling</h3>

            <div className="design-controls">
              <div className="control-group">
                <label>
                  <span>Theme:</span>
                  <select
                    value={config.theme}
                    onChange={(e) =>
                      setConfig({ ...config, theme: e.target.value })
                    }
                  >
                    <option value="nature">Nature</option>
                    <option value="tech">Tech</option>
                    <option value="business">Business</option>
                    <option value="creative">Creative</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </label>
              </div>

              <div className="control-group">
                <label>
                  <span>Text Color:</span>
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) =>
                      setConfig({ ...config, textColor: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="control-group">
                <label>
                  <span>Font Style:</span>
                  <select
                    value={config.fontStyle}
                    onChange={(e) =>
                      setConfig({ ...config, fontStyle: e.target.value })
                    }
                  >
                    <option value="sans">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                    <option value="script">Script</option>
                  </select>
                </label>
              </div>

              <div className="control-group">
                <label>
                  <span>Layout:</span>
                  <select
                    value={config.layoutTemplate}
                    onChange={(e) =>
                      setConfig({ ...config, layoutTemplate: e.target.value })
                    }
                  >
                    <option value="classic">Classic Center</option>
                    <option value="top">Top Aligned</option>
                    <option value="bottom">Bottom Aligned</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </label>
              </div>

              <div className="control-group">
                <label>
                  <span>Overlay Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.overlayOpacity}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        overlayOpacity: parseFloat(e.target.value),
                      })
                    }
                  />
                  <span>{Math.round(config.overlayOpacity * 100)}%</span>
                </label>
              </div>
            </div>
          </section>

          {/* SLIDESHOW EFFECTS */}
          <section className="effects-section">
            <h3>✨ Slideshow Effects</h3>
            <p className="section-description">
              Choose a transition effect between quote images
            </p>

            <div className="effects-grid">
              {SLIDESHOW_EFFECTS.map((effect) => (
                <button
                  key={effect.id}
                  className={`effect-card ${selectedEffect === effect.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedEffect(effect.id);
                    setConfig({
                      ...config,
                      slideshowEffect: effect.id,
                      effectParams: effect.params || {},
                    });
                  }}
                >
                  <span className="effect-icon">{effect.icon}</span>
                  <span className="effect-name">{effect.name}</span>
                  <span className="effect-desc">{effect.description}</span>
                </button>
              ))}
            </div>

            {/* EFFECT PARAMETERS */}
            {config.effectParams && Object.keys(config.effectParams).length > 0 && (
              <div className="effect-params">
                <h4>⚙️ Effect Parameters</h4>
                {Object.entries(config.effectParams).map(([key, value]) => {
                  const effect = SLIDESHOW_EFFECTS.find(
                    (e) => e.id === selectedEffect
                  );
                  const param = effect?.params?.[key];
                  if (!param) return null;

                  return (
                    <div key={key} className="param-control">
                      <label>
                        <span>{key}:</span>
                        <input
                          type="range"
                          min={param.minValue}
                          max={param.maxValue}
                          step={0.1}
                          value={value}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              effectParams: {
                                ...config.effectParams,
                                [key]: parseFloat(e.target.value),
                              },
                            })
                          }
                        />
                        <span className="param-value">{parseFloat(value).toFixed(1)}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="preview-section">
            <h3>👁️ Preview</h3>
            <div className="preview-box">
              <p style={{ color: config.textColor, textAlign: 'center' }}>
                "Sample quote here"
              </p>
              <p
                style={{
                  color: config.textColor,
                  textAlign: 'center',
                  fontSize: '12px',
                  opacity: 0.8,
                }}
              >
                — Author Name
              </p>
              <small style={{ color: config.textColor, opacity: 0.6 }}>
                Effect: {SLIDESHOW_EFFECTS.find((e) => e.id === selectedEffect)?.name}
              </small>
            </div>
          </section>

          <div className="composition-actions">
            <button className="btn btn-secondary" onClick={() => setStep('timing')}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={handleComplete}>
              Next: Export →
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
