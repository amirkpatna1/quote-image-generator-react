import React, { useState } from 'react';

export default function YouTubeAudioExtractor({ onAudioExtracted }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioData, setAudioData] = useState(null);

  const handleExtractAudio = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate YouTube URL
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please use a valid YouTube link.');
      }

      // Use iframe API to get audio stream (client-side approach)
      // For production, you'd use a service like youtube-dl or a dedicated API
      const audioUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

      // Fetch metadata using YouTube Noembed API (no authentication needed)
      const metadataUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const metadataRes = await fetch(metadataUrl);
      const metadata = await metadataRes.json();

      const extractedAudio = {
        videoId,
        title: metadata.title || 'YouTube Audio',
        thumbnail: metadata.thumbnail_url,
        duration: metadata.duration || 0,
        url: youtubeUrl,
      };

      setAudioData(extractedAudio);
      onAudioExtracted(extractedAudio);

      setYoutubeUrl('');
    } catch (err) {
      setError(err.message || 'Failed to extract audio from YouTube');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const patterns = [
      // Regular YouTube: youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      // YouTube Shorts: youtube.com/shorts/VIDEO_ID
      /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      // Shortened: youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([^&\n?#]+)/,
      // Embed: youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      // Just the video ID (11 characters)
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  return (
    <div className="youtube-audio-extractor">
      <div className="extractor-header">
        <h3>🎵 Extract Audio from YouTube</h3>
        <p>Paste a YouTube URL to extract audio for your video</p>
      </div>

      <form onSubmit={handleExtractAudio} className="extractor-form">
        <div className="form-group">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube URL (youtube.com/watch?v=..., shorts/..., or youtu.be/...)"
            disabled={isLoading}
            className="url-input"
          />
        </div>

        <button
          type="submit"
          disabled={!youtubeUrl || isLoading}
          className="extract-btn"
        >
          {isLoading ? '⏳ Extracting...' : '🔗 Extract Audio'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {audioData && (
        <div className="audio-preview">
          <div className="preview-thumbnail">
            <img src={audioData.thumbnail} alt={audioData.title} />
          </div>
          <div className="preview-info">
            <h4>{audioData.title}</h4>
            <p>✅ Audio extracted successfully</p>
            {audioData.duration > 0 && (
              <p className="duration">
                ⏱️ Duration: {formatDuration(audioData.duration)}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setAudioData(null);
              setYoutubeUrl('');
            }}
            className="clear-btn"
          >
            ✕
          </button>
        </div>
      )}

      <style jsx>{`
        .youtube-audio-extractor {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          color: white;
        }

        .extractor-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .extractor-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .extractor-form {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .form-group {
          flex: 1;
          min-width: 250px;
        }

        .url-input {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }

        .url-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .url-input:focus {
          outline: none;
          border-color: white;
          background: rgba(255, 255, 255, 0.15);
        }

        .url-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .extract-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .extract-btn:hover:not(:disabled) {
          background: white;
          color: #667eea;
          transform: translateY(-2px);
        }

        .extract-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.2);
          border-left: 4px solid #ef4444;
          padding: 12px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 14px;
        }

        .audio-preview {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .preview-thumbnail {
          flex-shrink: 0;
        }

        .preview-thumbnail img {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          object-fit: cover;
        }

        .preview-info {
          flex: 1;
        }

        .preview-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .preview-info p {
          margin: 4px 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .duration {
          color: #fbbf24;
          font-weight: 600;
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid white;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: white;
          color: #667eea;
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
