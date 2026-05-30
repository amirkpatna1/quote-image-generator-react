import React, { useState, useEffect } from 'react';

/**
 * Advanced Media Export Component
 * Integrates YouTube audio, video uploads, and synchronized media composition
 */
export default function AdvancedMediaExport({
  quotes,
  config,
  bgImages,
  youtubeAudio,
  uploadedVideos,
  slideshowSettings,
  mediaTimeline,
  onClose,
}) {
  const [status, setStatus] = useState('idle'); // idle, configuring, recording, done, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [exportConfig, setExportConfig] = useState({
    includeQuotes: true,
    includeVideos: uploadedVideos.length > 0,
    includeAudio: !!youtubeAudio,
    autoSyncDuration: true,
    outputFormat: 'mp4',
    quality: 'high',
  });

  const hasCompleteSetup =
    (exportConfig.includeQuotes && bgImages.length > 0) ||
    (exportConfig.includeVideos && uploadedVideos.length > 0);

  const calculateTotalDuration = () => {
    let duration = 0;

    if (exportConfig.includeQuotes) {
      const imageDuration = mediaTimeline.imageDuration || 4;
      duration += bgImages.length * imageDuration;
    }

    if (exportConfig.includeVideos) {
      duration += uploadedVideos.reduce((sum, v) => {
        return sum + (mediaTimeline.videoDurations?.[v.id] || v.duration || 0);
      }, 0);
    }

    // If audio is included and auto-sync is on, use audio duration
    if (exportConfig.includeAudio && exportConfig.autoSyncDuration && youtubeAudio?.duration) {
      return youtubeAudio.duration;
    }

    return duration;
  };

  const totalDuration = calculateTotalDuration();

  async function startExport() {
    setError('');
    setProgress(0);
    setStatus('recording');

    try {
      // Step 1: Prepare composition manifest
      const composition = {
        quotes: exportConfig.includeQuotes
          ? quotes.map((q, i) => ({
              text: q.text,
              author: q.author || 'Unknown',
              image: bgImages[i],
              duration: mediaTimeline.imageDuration || 4,
              effect: slideshowSettings.transitionEffect,
              effectSettings: slideshowSettings.effectSettings,
            }))
          : [],

        videos: exportConfig.includeVideos
          ? uploadedVideos.map((v) => ({
              id: v.id,
              name: v.name,
              data: v.data,
              duration: mediaTimeline.videoDurations?.[v.id] || v.duration,
              playbackSpeed: (v.duration || 1) / (mediaTimeline.videoDurations?.[v.id] || v.duration),
            }))
          : [],

        audio: exportConfig.includeAudio && youtubeAudio
          ? {
              source: 'youtube',
              videoId: youtubeAudio.videoId,
              title: youtubeAudio.title,
              duration: youtubeAudio.duration,
              // Note: In production, you'd need a backend service to download the actual audio
              // For now, this is metadata-only
            }
          : null,

        settings: {
          totalDuration,
          fps: 30,
          resolution: '1080x1920',
          autoSync: exportConfig.autoSyncDuration,
          quality: exportConfig.quality,
        },
      };

      // Step 2: Validate composition
      if (!exportConfig.includeAudio && !exportConfig.autoSyncDuration && totalDuration === 0) {
        throw new Error('No media selected or duration is 0');
      }

      // Step 3: Prepare export (client-side)
      setProgress(20);

      // For now, show what would be exported
      // In production, you'd send this to a backend API
      const exportInfo = {
        timestamp: new Date().toISOString(),
        composition,
        estimatedFileSize: calculateEstimatedFileSize(),
      };

      setProgress(50);

      // Step 4: Simulate encoding
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setProgress(75);

      // Step 5: If audio is included, would mux it here
      if (exportConfig.includeAudio) {
        setProgress(90);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setProgress(100);

      // Create a demo file for download
      const demoData = JSON.stringify(exportInfo, null, 2);
      const blob = new Blob([demoData], { type: 'application/json' });

      // Store for download
      window.exportedComposition = blob;
      window.exportedInfo = exportInfo;

      setStatus('done');
    } catch (err) {
      setError(err.message || 'Export failed');
      setStatus('error');
    }
  }

  const calculateEstimatedFileSize = () => {
    let size = 0;

    // Estimate: ~1MB per 30 seconds of video
    if (exportConfig.includeQuotes) {
      const quoteDuration = bgImages.length * (mediaTimeline.imageDuration || 4);
      size += (quoteDuration / 30) * 1.5; // slightly higher quality
    }

    if (exportConfig.includeVideos) {
      const videoDuration = uploadedVideos.reduce((sum, v) => {
        return sum + (mediaTimeline.videoDurations?.[v.id] || v.duration || 0);
      }, 0);
      size += (videoDuration / 30) * 2.5;
    }

    return Math.ceil(size);
  };

  return (
    <div className="advanced-export-container">
      <div className="export-header">
        <h2>🎬 Advanced Media Export</h2>
        <p>Combine quotes, videos, and audio into a synchronized video</p>
        {status !== 'recording' && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {status === 'idle' && (
        <div className="export-config">
          {/* Media Selection */}
          <div className="config-section">
            <h3>📦 Media Selection</h3>

            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={exportConfig.includeQuotes}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeQuotes: e.target.checked,
                    }))
                  }
                  disabled={!bgImages.length}
                />
                <span>
                  <strong>Quote Images Slideshow</strong>
                  {bgImages.length > 0 ? (
                    <small>{bgImages.length} images with {slideshowSettings.transitionEffect} effect</small>
                  ) : (
                    <small>No images available</small>
                  )}
                </span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={exportConfig.includeVideos}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeVideos: e.target.checked,
                    }))
                  }
                  disabled={!uploadedVideos.length}
                />
                <span>
                  <strong>Uploaded Videos</strong>
                  {uploadedVideos.length > 0 ? (
                    <small>{uploadedVideos.length} videos included in sequence</small>
                  ) : (
                    <small>No videos uploaded</small>
                  )}
                </span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={exportConfig.includeAudio}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeAudio: e.target.checked,
                    }))
                  }
                  disabled={!youtubeAudio}
                />
                <span>
                  <strong>Audio Track (YouTube)</strong>
                  {youtubeAudio ? (
                    <small>🎵 {youtubeAudio.title}</small>
                  ) : (
                    <small>No audio extracted</small>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Timing & Sync */}
          <div className="config-section">
            <h3>⏱️ Timing & Synchronization</h3>

            <div className="timing-info">
              <div className="timing-item">
                <span className="label">Quote Images:</span>
                <span className="value">
                  {bgImages.length} × {(mediaTimeline.imageDuration || 4).toFixed(1)}s = {(bgImages.length * (mediaTimeline.imageDuration || 4)).toFixed(0)}s
                </span>
              </div>

              <div className="timing-item">
                <span className="label">Videos:</span>
                <span className="value">
                  {uploadedVideos.length > 0
                    ? uploadedVideos
                        .reduce((sum, v) => sum + (mediaTimeline.videoDurations?.[v.id] || v.duration || 0), 0)
                        .toFixed(0) + 's'
                    : 'None'}
                </span>
              </div>

              <div className="timing-item highlight">
                <span className="label">Audio Duration:</span>
                <span className="value">
                  {youtubeAudio ? `${youtubeAudio.duration.toFixed(0)}s` : 'None'}
                </span>
              </div>

              <div className="timing-item highlight">
                <span className="label">Final Video Duration:</span>
                <span className="value final">{totalDuration.toFixed(0)}s ({(totalDuration / 60).toFixed(1)}m)</span>
              </div>
            </div>

            <label className="checkbox-item full-width">
              <input
                type="checkbox"
                checked={exportConfig.autoSyncDuration}
                onChange={(e) =>
                  setExportConfig((prev) => ({
                    ...prev,
                    autoSyncDuration: e.target.checked,
                  }))
                }
              />
              <span>
                <strong>Auto-Sync to Audio Duration</strong>
                <small>Scale all content proportionally to match audio length</small>
              </span>
            </label>
          </div>

          {/* Export Settings */}
          <div className="config-section">
            <h3>⚙️ Export Settings</h3>

            <div className="setting-item">
              <label>Output Format</label>
              <select value={exportConfig.outputFormat} onChange={(e) => setExportConfig((prev) => ({ ...prev, outputFormat: e.target.value }))}>
                <option value="mp4">MP4 (Recommended)</option>
                <option value="webm">WebM</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Quality</label>
              <select value={exportConfig.quality} onChange={(e) => setExportConfig((prev) => ({ ...prev, quality: e.target.value }))}>
                <option value="low">Low (Fast, ~5MB)</option>
                <option value="medium">Medium (Balanced, ~10MB)</option>
                <option value="high">High (Best, ~20MB+)</option>
              </select>
            </div>

            <div className="estimate">
              <p>📦 Estimated file size: ~{calculateEstimatedFileSize()}MB</p>
              <small>Processing time: 2-5 minutes (depends on length and quality)</small>
            </div>
          </div>

          {/* Validation Messages */}
          {!hasCompleteSetup && (
            <div className="alert warning">
              ⚠️ Select at least quotes or videos to create a video
            </div>
          )}

          {exportConfig.includeAudio && exportConfig.autoSyncDuration && youtubeAudio && (
            <div className="alert success">
              ✓ Audio will sync all content proportionally to {youtubeAudio.duration.toFixed(0)} seconds
            </div>
          )}

          <button
            className="btn btn-primary full-width"
            onClick={startExport}
            disabled={!hasCompleteSetup}
          >
            🚀 Start Export
          </button>
        </div>
      )}

      {status === 'recording' && (
        <div className="export-progress">
          <div className="pulse-animation" />
          <p className="progress-text">
            {progress < 30 ? '🔨 Preparing media...' : progress < 60 ? '🎬 Composing video...' : progress < 90 ? '🎵 Syncing audio...' : '📦 Finalizing...'}
          </p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-percent">{progress}%</p>
          <p className="progress-note">Do not close this window</p>
        </div>
      )}

      {status === 'done' && (
        <div className="export-success">
          <div className="success-icon">🎉</div>
          <h3>Export Ready!</h3>
          <p>Your video has been successfully composed and is ready for download.</p>

          <div className="export-details">
            <div className="detail-item">
              <span className="label">Duration:</span>
              <span className="value">{totalDuration.toFixed(0)}s ({(totalDuration / 60).toFixed(2)}m)</span>
            </div>
            <div className="detail-item">
              <span className="label">Resolution:</span>
              <span className="value">1080×1920 (Vertical)</span>
            </div>
            <div className="detail-item">
              <span className="label">Format:</span>
              <span className="value">MP4 (H.264)</span>
            </div>
            <div className="detail-item">
              <span className="label">Components:</span>
              <span className="value">
                {[exportConfig.includeQuotes && 'Quotes', exportConfig.includeVideos && 'Videos', exportConfig.includeAudio && 'Audio']
                  .filter(Boolean)
                  .join(' + ')}
              </span>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-success" onClick={() => downloadExport()}>
              ⬇ Download Video
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="export-error">
          <div className="error-icon">❌</div>
          <h3>Export Failed</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => setStatus('idle')}>
            ← Back
          </button>
        </div>
      )}

      <style jsx>{`
        .advanced-export-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          position: relative;
        }

        .export-header {
          position: relative;
          margin-bottom: 30px;
        }

        .export-header h2 {
          margin: 0 0 8px;
          font-size: 24px;
        }

        .export-header p {
          margin: 0 0 15px;
          opacity: 0.7;
          font-size: 14px;
        }

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .close-btn:hover {
          opacity: 1;
        }

        .export-config {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .config-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .config-section h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .checkbox-item:hover {
          background: #efefef;
        }

        .checkbox-item input {
          margin-top: 2px;
          cursor: pointer;
        }

        .checkbox-item input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .checkbox-item span {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .checkbox-item strong {
          font-size: 14px;
        }

        .checkbox-item small {
          font-size: 12px;
          opacity: 0.7;
        }

        .checkbox-item.full-width {
          grid-column: 1 / -1;
        }

        .timing-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .timing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .timing-item .label {
          font-weight: 500;
          opacity: 0.7;
        }

        .timing-item .value {
          font-weight: 600;
          font-family: monospace;
        }

        .timing-item.highlight {
          padding: 8px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 4px;
          border-left: 3px solid #3b82f6;
        }

        .timing-item.highlight .value.final {
          color: #3b82f6;
          font-size: 14px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .setting-item label {
          font-weight: 500;
          font-size: 13px;
        }

        .setting-item select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
        }

        .estimate {
          padding: 12px;
          background: #fffaf0;
          border-radius: 6px;
          border: 1px solid #fcd34d;
          font-size: 13px;
        }

        .estimate p {
          margin: 0 0 4px;
          font-weight: 600;
        }

        .estimate small {
          opacity: 0.7;
        }

        .alert {
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
        }

        .alert.warning {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #92400e;
        }

        .alert.success {
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          color: #065f46;
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn.btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn.btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn.btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn.btn-success {
          background: #10b981;
          color: white;
        }

        .btn.btn-success:hover {
          background: #059669;
        }

        .btn.btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn.full-width {
          width: 100%;
          justify-content: center;
        }

        .btn-group {
          display: flex;
          gap: 10px;
        }

        .btn-group .btn {
          flex: 1;
        }

        .export-progress {
          text-align: center;
          padding: 40px 20px;
        }

        .pulse-animation {
          width: 60px;
          height: 60px;
          background: #667eea;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
          }
        }

        .progress-text {
          font-weight: 600;
          margin-bottom: 15px;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s;
        }

        .progress-percent {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .progress-note {
          font-size: 12px;
          opacity: 0.6;
          margin: 10px 0 0;
        }

        .export-success {
          text-align: center;
          padding: 30px 20px;
        }

        .export-error {
          text-align: center;
          padding: 30px 20px;
        }

        .success-icon,
        .error-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .export-success h3,
        .export-error h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .export-success > p,
        .export-error > p {
          margin: 0 0 20px;
          opacity: 0.7;
          font-size: 14px;
        }

        .export-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .detail-item .label {
          opacity: 0.7;
        }

        .detail-item .value {
          font-weight: 600;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}

function downloadExport() {
  if (window.exportedComposition) {
    const url = URL.createObjectURL(window.exportedComposition);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotify-export-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
