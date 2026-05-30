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

      <style jsx>{`
        .export-review-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .export-content h2 {
          margin: 0 0 30px;
          font-size: 28px;
          font-weight: 700;
        }

        section {
          margin-bottom: 30px;
          padding: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .summary-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .summary-item .label {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 6px;
        }

        .summary-item .value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-item .value.strong {
          font-size: 18px;
          color: #3b82f6;
        }

        .design-details {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          font-weight: 500;
          color: #6b7280;
        }

        .detail-row .value {
          font-weight: 600;
          color: #1f2937;
        }

        .detail-row .value.flex-center {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-swatch {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
        }

        .arrangement-preview {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .block {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .block.quotes-block {
          border-left-color: #8b5cf6;
        }

        .block.video-block {
          border-left-color: #06b6d4;
        }

        .block.audio-block {
          border-left-color: #ec4899;
        }

        .block-icon {
          font-size: 18px;
          min-width: 24px;
        }

        .block-label {
          flex: 1;
          font-weight: 500;
          color: #1f2937;
        }

        .block-duration {
          font-size: 12px;
          opacity: 0.7;
          font-family: monospace;
          font-weight: 600;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .option-group label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .option-group select {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 13px;
        }

        .option-group select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .estimates {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .estimate-box {
          padding: 12px;
          background: linear-gradient(135deg, #f0f4ff, #fef2f8);
          border-radius: 8px;
          text-align: center;
        }

        .estimate-label {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 6px;
        }

        .estimate-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #3b82f6;
        }

        .export-action {
          margin-top: 30px;
        }

        .progress-section {
          text-align: center;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 6px;
        }

        .progress-subtext {
          font-size: 13px;
          opacity: 0.7;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .btn.btn-secondary {
          background: #f3f4f6;
          color: #1f2937;
        }

        .btn.btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn.btn-export {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
        }

        .btn.btn-export:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-box {
          background: #f0f9ff;
          border: 1px solid #0284c7;
          border-radius: 8px;
          padding: 16px;
        }

        .info-box h4 {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0369a1;
        }

        .info-box ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #164e63;
        }

        .info-box li {
          margin-bottom: 6px;
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .estimates {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
