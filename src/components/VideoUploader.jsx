import React, { useState } from 'react';

export default function VideoUploader({ onVideosUploaded, maxVideos = 5 }) {
  const [videos, setVideos] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = (files) => {
    setIsProcessing(true);
    const newVideos = [];

    Array.from(files).forEach((file) => {
      // Check file type
      if (!file.type.startsWith('video/')) {
        console.warn(`Skipped ${file.name}: not a video file`);
        return;
      }

      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        console.warn(`Skipped ${file.name}: file too large (max 500MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const videoData = {
          id: `video_${Date.now()}_${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          duration: 0,
          thumbnail: null,
          data: e.target.result,
        };

        // Get video metadata (duration, thumbnail)
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          videoData.duration = Math.floor(video.duration);

          // Generate thumbnail
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          videoData.thumbnail = canvas.toDataURL('image/jpeg');

          setVideos((prev) => {
            const updated = [...prev, videoData];
            if (updated.length === newVideos.length && isProcessing) {
              setIsProcessing(false);
              onVideosUploaded(updated);
            }
            return updated;
          });
        };

        video.src = URL.createObjectURL(file);
      };

      reader.readAsArrayBuffer(file);
      newVideos.push(file);
    });

    if (newVideos.length === 0) {
      setIsProcessing(false);
    }
  };

  const removeVideo = (id) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    onVideosUploaded(updated);
  };

  const reorderVideos = (fromIndex, toIndex) => {
    const updated = [...videos];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    setVideos(updated);
    onVideosUploaded(updated);
  };

  const canAddMore = videos.length < maxVideos;

  return (
    <div className="video-uploader">
      <div className="uploader-header">
        <h3>🎥 Upload Videos</h3>
        <p>Drag and drop your videos or click to select (max {maxVideos})</p>
      </div>

      {canAddMore && (
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileInput}
            disabled={!canAddMore || isProcessing}
            style={{ display: 'none' }}
            id="video-input"
          />
          <label htmlFor="video-input" className="drop-label">
            {isProcessing ? (
              <>
                <span className="spinner">⏳</span>
                <p>Processing videos...</p>
              </>
            ) : (
              <>
                <span className="icon">🎬</span>
                <p>Drop videos here or click to browse</p>
                <small>MP4, WebM, MOV, etc. • Max 500MB each</small>
              </>
            )}
          </label>
        </div>
      )}

      {videos.length > 0 && (
        <div className="videos-list">
          <h4>Selected Videos ({videos.length}/{maxVideos})</h4>
          {videos.map((video, index) => (
            <div key={video.id} className="video-item">
              <div className="video-thumbnail">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.name} />
                ) : (
                  <div className="thumbnail-placeholder">🎥</div>
                )}
              </div>

              <div className="video-info">
                <h5>{video.name}</h5>
                <div className="video-meta">
                  <span className="duration">⏱️ {formatDuration(video.duration)}</span>
                  <span className="size">📦 {formatFileSize(video.size)}</span>
                </div>
              </div>

              <div className="video-controls">
                {index > 0 && (
                  <button
                    onClick={() => reorderVideos(index, index - 1)}
                    className="order-btn"
                    title="Move up"
                  >
                    ↑
                  </button>
                )}
                {index < videos.length - 1 && (
                  <button
                    onClick={() => reorderVideos(index, index + 1)}
                    className="order-btn"
                    title="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  onClick={() => removeVideo(video.id)}
                  className="remove-btn"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .video-uploader {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          color: white;
        }

        .uploader-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .uploader-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .drop-zone {
          border: 3px dashed rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 15px;
        }

        .drop-zone.active {
          border-color: white;
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.02);
        }

        .drop-label {
          display: block;
          cursor: pointer;
        }

        .icon {
          font-size: 40px;
          display: block;
          margin-bottom: 10px;
        }

        .spinner {
          display: inline-block;
          font-size: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .drop-label p {
          margin: 10px 0 5px;
          font-weight: 600;
          font-size: 16px;
        }

        .drop-label small {
          display: block;
          opacity: 0.8;
          font-size: 12px;
        }

        .videos-list {
          margin-top: 20px;
        }

        .videos-list h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .video-item {
          display: flex;
          gap: 12px;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .video-thumbnail {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .video-info {
          flex: 1;
        }

        .video-info h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          word-break: break-word;
        }

        .video-meta {
          display: flex;
          gap: 10px;
          font-size: 12px;
          opacity: 0.8;
        }

        .video-controls {
          display: flex;
          gap: 6px;
        }

        .order-btn,
        .remove-btn {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .order-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .remove-btn:hover {
          background: #ef4444;
          border-color: white;
        }
      `}</style>
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
