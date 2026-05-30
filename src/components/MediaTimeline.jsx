import React, { useState, useMemo } from 'react';

export default function MediaTimeline({
  images = [],
  videos = [],
  audio = null,
  onTimelineChange,
}) {
  const [imageDuration, setImageDuration] = useState(4);
  const [videoDurations, setVideoDurations] = useState({});
  const [autoSync, setAutoSync] = useState(true);

  const audioDuration = audio?.duration || 0;

  // Calculate total content duration
  const contentDuration = useMemo(() => {
    const imageTotal = images.length * imageDuration;
    const videoTotal = videos.reduce((sum, v) => {
      return sum + (videoDurations[v.id] || v.duration || 0);
    }, 0);
    return imageTotal + videoTotal;
  }, [images, videos, imageDuration, videoDurations]);

  // Calculate how to fit content to audio
  const calculateFitStrategy = () => {
    if (!audioDuration || contentDuration === 0) {
      return null;
    }

    const diff = audioDuration - contentDuration;
    const ratio = audioDuration / contentDuration;

    return {
      difference: diff,
      ratio: ratio,
      needsExtension: diff > 0,
      needsTrimming: diff < 0,
      adjustment: Math.abs(diff),
    };
  };

  const strategy = calculateFitStrategy();

  const handleAutoSync = () => {
    if (!strategy || !strategy.ratio) return;

    // Scale all durations by the same ratio
    const newImageDuration = imageDuration * strategy.ratio;
    const newVideoDurations = {};

    videos.forEach((v) => {
      newVideoDurations[v.id] = (videoDurations[v.id] || v.duration) * strategy.ratio;
    });

    setImageDuration(newImageDuration);
    setVideoDurations(newVideoDurations);

    onTimelineChange?.({
      imageDuration: newImageDuration,
      videoDurations: newVideoDurations,
      totalDuration: audioDuration,
    });
  };

  const handleVideoSpeedAdjustment = (videoId, speed) => {
    const originalDuration = videos.find((v) => v.id === videoId)?.duration || 0;
    const newDuration = originalDuration / speed;

    setVideoDurations((prev) => ({
      ...prev,
      [videoId]: newDuration,
    }));

    onTimelineChange?.({
      imageDuration,
      videoDurations: {
        ...videoDurations,
        [videoId]: newDuration,
      },
      totalDuration: contentDuration,
    });
  };

  const handleImageDurationChange = (newDuration) => {
    setImageDuration(newDuration);
    onTimelineChange?.({
      imageDuration: newDuration,
      videoDurations,
      totalDuration: contentDuration,
    });
  };

  return (
    <div className="media-timeline">
      <div className="timeline-header">
        <h3>⏱️ Media Timeline & Duration Sync</h3>
        <p>Adjust timing to match your audio perfectly</p>
      </div>

      {/* Audio Duration Display */}
      {audio && (
        <div className="audio-info">
          <div className="info-item">
            <span className="label">🎵 Audio Duration:</span>
            <span className="value">{formatTime(audioDuration)}</span>
          </div>
          <div className="info-item">
            <span className="label">📺 Content Duration:</span>
            <span className={`value ${contentDuration > audioDuration ? 'warning' : contentDuration < audioDuration ? 'info' : 'success'}`}>
              {formatTime(contentDuration)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">⚖️ Difference:</span>
            {strategy && (
              <span className={`value ${strategy.needsExtension ? 'info' : 'warning'}`}>
                {strategy.needsExtension ? '+' : '-'}
                {formatTime(strategy.adjustment)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auto-Sync Controls */}
      {strategy && (
        <div className="sync-controls">
          <div className="sync-message">
            {strategy.needsExtension ? (
              <p>⚠️ Content is {formatTime(strategy.adjustment)} shorter than audio. Need to extend playback.</p>
            ) : (
              <p>⚠️ Content is {formatTime(strategy.adjustment)} longer than audio. Need to trim or speed up.</p>
            )}
          </div>
          <button
            onClick={handleAutoSync}
            className="sync-btn"
          >
            ✨ Auto-Sync to Audio
          </button>
          <small>This will proportionally adjust all image and video timings</small>
        </div>
      )}

      {/* Image Duration Settings */}
      {images.length > 0 && (
        <div className="duration-settings">
          <h4>🖼️ Image Duration</h4>
          <div className="setting-item">
            <label>
              <span>Time per image:</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={imageDuration}
                onChange={(e) => handleImageDurationChange(parseFloat(e.target.value))}
              />
              <span className="value">{imageDuration.toFixed(1)}s</span>
            </label>
            <small>
              {images.length} images × {imageDuration.toFixed(1)}s = {(images.length * imageDuration).toFixed(1)}s total
            </small>
          </div>
        </div>
      )}

      {/* Video Speed Adjustment */}
      {videos.length > 0 && (
        <div className="duration-settings">
          <h4>🎬 Video Speed Adjustment</h4>
          {videos.map((video) => {
            const duration = videoDurations[video.id] || video.duration;
            const speed = video.duration / duration;

            return (
              <div key={video.id} className="video-duration-item">
                <div className="video-name">{video.name}</div>
                <div className="speed-controls">
                  <label>
                    <span>Speed:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => handleVideoSpeedAdjustment(video.id, parseFloat(e.target.value))}
                    />
                    <span className="value">{speed.toFixed(1)}x</span>
                  </label>
                </div>
                <div className="duration-display">
                  <span className="original">Original: {formatTime(video.duration)}</span>
                  <span className="arrow">→</span>
                  <span className="adjusted">Adjusted: {formatTime(duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Visualization */}
      <div className="timeline-visualization">
        <h4>Timeline Preview</h4>
        <div className="timeline-bar">
          {/* Audio track */}
          <div className="track audio-track">
            <div className="track-label">Audio</div>
            <div className="track-duration" style={{ width: `${Math.min((audioDuration / (Math.max(audioDuration, contentDuration) + 5)) * 100, 100)}%` }}>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>

          {/* Content track */}
          <div className="track content-track">
            <div className="track-label">Content</div>
            <div className="track-duration" style={{ width: `${Math.min((contentDuration / (Math.max(audioDuration, contentDuration) + 5)) * 100, 100)}%` }}>
              <span>{formatTime(contentDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .media-timeline {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          color: white;
        }

        .timeline-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .timeline-header p {
          margin: 0 0 15px 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .audio-info {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .info-item .label {
          opacity: 0.8;
        }

        .info-item .value {
          font-weight: 700;
          font-size: 16px;
        }

        .value.success {
          color: #10b981;
        }

        .value.warning {
          color: #f59e0b;
        }

        .value.info {
          color: #3b82f6;
        }

        .sync-controls {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          text-align: center;
        }

        .sync-controls p {
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .sync-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sync-btn:hover {
          background: white;
          color: #fa709a;
          transform: scale(1.05);
        }

        .sync-controls small {
          display: block;
          margin-top: 8px;
          opacity: 0.8;
          font-size: 12px;
        }

        .duration-settings {
          background: rgba(0, 0, 0, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .duration-settings h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .setting-item input[type="range"] {
          flex: 1;
          max-width: 200px;
        }

        .setting-item .value {
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .setting-item small {
          font-size: 12px;
          opacity: 0.8;
        }

        .video-duration-item {
          background: rgba(0, 0, 0, 0.15);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .video-name {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .speed-controls label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .speed-controls input[type="range"] {
          flex: 1;
          max-width: 150px;
        }

        .duration-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          opacity: 0.8;
        }

        .duration-display .original,
        .duration-display .adjusted {
          flex: 1;
        }

        .timeline-visualization {
          background: rgba(0, 0, 0, 0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .timeline-visualization h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .timeline-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .track {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .track-label {
          min-width: 60px;
          font-size: 12px;
          font-weight: 600;
          opacity: 0.8;
        }

        .track-duration {
          background: rgba(255, 255, 255, 0.3);
          padding: 8px 12px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
          min-height: 32px;
        }

        .audio-track .track-duration {
          background: rgba(255, 255, 255, 0.4);
        }

        .content-track .track-duration {
          background: rgba(255, 255, 255, 0.25);
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
