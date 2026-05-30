import '../styles/ExportReview.css';
import React, { useState } from 'react';

/**
 * STEP 4: EXPORT & REVIEW
 * Review composition and export final video
 */
export default function ExportReview({
  mediaConfig,
  onBack,
  onExport,
}) {
  const {
    quotes,
    audioMetadata,
    useVideos,
    useAudio,
    useCustomImages,
    videos = [],
    imageDuration = 4,
    config = {},
  } = mediaConfig;

  const [exportFormat, setExportFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Calculate composition summary
  const contentDuration = quotes.length * imageDuration + (videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0);
  const audioDuration = audioMetadata?.duration || 0;
  const finalDuration = Math.max(contentDuration, audioDuration);

  // Estimate file size based on quality and duration
  const estimateFileSize = () => {
    const bitrates = {
      low: 2,    // 2 Mbps
      medium: 4,  // 4 Mbps
      high: 8,    // 8 Mbps
    };
    const bitrate = bitrates[quality];
    const sizeInMB = (bitrate * finalDuration) / 8;
    return sizeInMB.toFixed(1);
  };

  const estimateProcessingTime = () => {
    const times = {
      low: 30,
      medium: 60,
      high: 90,
    };
    return times[quality];
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      await onExport({
        format: exportFormat,
        quality,
        composition: mediaConfig,
      });

      clearInterval(progressInterval);
      setExportProgress(100);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="export-review-container">
      <div className="export-content">
        <h2>📦 Export & Review</h2>

        {/* COMPOSITION SUMMARY */}
        <section className="summary-section">
          <h3>📋 Composition Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">📝 Quotes</span>
              <span className="value">{quotes.length} images</span>
            </div>
            <div className="summary-item">
              <span className="label">⏱️ Quote Duration</span>
              <span className="value">{formatTime(quotes.length * imageDuration)}</span>
            </div>
            {useVideos && videos.length > 0 && (
              <>
                <div className="summary-item">
                  <span className="label">🎬 Videos</span>
                  <span className="value">{videos.length} clips</span>
                </div>
                <div className="summary-item">
                  <span className="label">⏱️ Video Duration</span>
                  <span className="value">{formatTime(videos.reduce((sum, v) => sum + (v.duration || 0), 0))}</span>
                </div>
              </>
            )}
            {useAudio && audioMetadata && (
              <div className="summary-item">
                <span className="label">🎵 Audio</span>
                <span className="value">{formatTime(audioDuration)}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">⏰ Final Duration</span>
              <span className="value strong">{formatTime(finalDuration)}</span>
            </div>
          </div>
        </section>

        {/* DESIGN SETTINGS */}
        <section className="design-summary">
          <h3>🎨 Design Settings</h3>
          <div className="design-details">
            <div className="detail-row">
              <span className="label">Theme:</span>
              <span className="value">{config.theme || 'Default'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Text Color:</span>
              <span className="value flex-center">
                <span
                  className="color-swatch"
                  style={{ backgroundColor: config.textColor || '#ffffff' }}
                />
                {config.textColor || '#ffffff'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Overlay Opacity:</span>
              <span className="value">{Math.round((config.overlayOpacity || 0.5) * 100)}%</span>
            </div>
          </div>
        </section>

        {/* MEDIA ARRANGEMENT */}
        <section className="arrangement-section">
          <h3>📹 Media Arrangement</h3>
          <div className="arrangement-preview">
            <div className="block quotes-block">
              <span className="block-icon">🖼️</span>
              <span className="block-label">Quote Slideshow</span>
              <span className="block-duration">{formatTime(quotes.length * imageDuration)}</span>
            </div>
            {useVideos && videos.length > 0 && videos.map((video, idx) => (
              <div key={video.id} className="block video-block">
                <span className="block-icon">🎬</span>
                <span className="block-label">{video.name}</span>
                <span className="block-duration">{formatTime(video.duration)}</span>
              </div>
            ))}
            {useAudio && audioMetadata && (
              <div className="block audio-block">
                <span className="block-icon">🎵</span>
                <span className="block-label">Audio Track</span>
                <span className="block-duration">{formatTime(audioDuration)}</span>
              </div>
            )}
          </div>
        </section>

        {/* EXPORT OPTIONS */}
        <section className="export-options">
          <h3>⚙️ Export Settings</h3>

          <div className="options-grid">
            <div className="option-group">
              <label>
                <span>Format:</span>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={isExporting}
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WebM (VP8)</option>
                  <option value="mov">MOV (ProRes)</option>
                </select>
              </label>
            </div>

            <div className="option-group">
              <label>
                <span>Quality:</span>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isExporting}
                >
                  <option value="low">Low (360p, 2 Mbps)</option>
                  <option value="medium">Medium (720p, 4 Mbps)</option>
                  <option value="high">High (1080p, 8 Mbps)</option>
                </select>
              </label>
            </div>
          </div>

          {/* ESTIMATES */}
          <div className="estimates">
            <div className="estimate-box">
              <span className="estimate-label">Estimated File Size</span>
              <span className="estimate-value">{estimateFileSize()} MB</span>
            </div>
            <div className="estimate-box">
              <span className="estimate-label">Processing Time</span>
              <span className="estimate-value">~{estimateProcessingTime()}s</span>
            </div>
          </div>
        </section>

        {/* EXPORT BUTTON AND PROGRESS */}
        <section className="export-action">
          {isExporting ? (
            <div className="progress-section">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="progress-text">
                Exporting... {Math.round(exportProgress)}%
              </p>
              <p className="progress-subtext">
                Please keep the browser open
              </p>
            </div>
          ) : (
            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back
              </button>
              <button
                className="btn btn-export"
                onClick={handleExport}
                disabled={isExporting}
              >
                ✨ Export Video
              </button>
            </div>
          )}
        </section>

        {/* INFO BOX */}
        <section className="info-box">
          <h4>💡 Export Tips</h4>
          <ul>
            <li>Lower quality exports process faster but have reduced resolution</li>
            <li>Make sure your browser stays open during the export process</li>
            <li>The video will automatically download when ready</li>
            <li>All media (quotes, videos, audio) will be included in the final video</li>
          </ul>
        </section>
      </div>

      
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
