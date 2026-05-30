import React, { useState } from 'react';
import UploadCard from './UploadCard';

/**
 * STEP 1: UNIFIED MEDIA INPUT
 * All raw ingredients in one place:
 * - Quotes (required)
 * - Videos (optional)
 * - Audio (optional)
 * - Images (optional)
 */
export default function MediaInput({
  onComplete,
  onUseOldWorkflow,
}) {
  const [quotes, setQuotes] = useState([]);
  const [useVideos, setUseVideos] = useState(false);
  const [useAudio, setUseAudio] = useState(false);
  const [useCustomImages, setUseCustomImages] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioMetadata, setAudioMetadata] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  const handleQuotesReady = (parsedQuotes) => {
    setQuotes(parsedQuotes);
    const mediaConfig = {
      quotes: parsedQuotes,
      useVideos,
      useAudio: useAudio && audioMetadata,
      audioMetadata,
      useCustomImages,
    };
    onComplete(mediaConfig);
  };

  const extractYoutubeAudio = async () => {
    if (!youtubeUrl) return;
    
    setIsLoadingAudio(true);
    setAudioError('');

    try {
      // Extract video ID
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Fetch metadata
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();

      if (!data.title) {
        throw new Error('Could not fetch video information');
      }

      setAudioMetadata({
        videoId,
        title: data.title,
        thumbnail: data.thumbnail_url,
        duration: data.video_duration || 0,
        url: youtubeUrl,
      });

      setYoutubeUrl('');
    } catch (err) {
      setAudioError(err.message || 'Failed to extract audio');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setAudioError('Please select an audio file (MP3, WAV, M4A, etc.)');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setAudioError('File too large (max 100MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        setAudioMetadata({
          source: 'file',
          title: file.name,
          duration: Math.floor(audio.duration),
          data: event.target.result,
        });
        setAudioFile(file);
        setAudioError('');
      };
      audio.onerror = () => {
        setAudioError('Could not read audio file');
      };
      audio.src = URL.createObjectURL(file);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  return (
    <div className="media-input-container">
      <div className="media-input-header">
        <h1>Create Your Quote Video</h1>
        <p>Gather all ingredients: quotes, videos, and audio</p>
      </div>

      <div className="media-input-content">
        {/* STEP 1: QUOTES (REQUIRED) */}
        <section className="media-section required">
          <div className="section-header">
            <h2>📝 Your Quotes (Required)</h2>
            <span className="badge required-badge">Required</span>
          </div>
          <p className="section-description">Upload CSV or add quotes manually</p>

          <UploadCard
            onNext={handleQuotesReady}
            onAddQuote={() => {}}
            history={[]}
            onLoadHistory={() => {}}
            onDeleteHistory={() => {}}
            onClearHistory={() => {}}
          />
        </section>

        {/* STEP 2: VIDEOS (OPTIONAL) */}
        <section className="media-section optional">
          <div className="section-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useVideos}
                onChange={(e) => setUseVideos(e.target.checked)}
              />
              <span>
                <h2>🎬 Video Clips (Optional)</h2>
              </span>
            </label>
            <span className="badge">Optional</span>
          </div>
          <p className="section-description">Add intro/outro or clips between quotes</p>

          {useVideos && (
            <div className="optional-content">
              <div className="info-box">
                <p>📌 <strong>Max 5 videos, 500MB each</strong></p>
                <p>Use for: intro clips, outro clips, transitions between quotes</p>
              </div>

              <div className="placeholder-box">
                <p>🎥 Video upload coming in composition step</p>
                <small>You can upload and manage videos in Step 2</small>
              </div>
            </div>
          )}
        </section>

        {/* STEP 3: AUDIO (OPTIONAL) */}
        <section className="media-section optional">
          <div className="section-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useAudio}
                onChange={(e) => setUseAudio(e.target.checked)}
              />
              <span>
                <h2>🎵 Audio Track (Optional)</h2>
              </span>
            </label>
            <span className="badge">Optional</span>
          </div>
          <p className="section-description">Background music or narration (sets video duration)</p>

          {useAudio && (
            <div className="optional-content">
              {/* YouTube Option */}
              <div className="audio-option">
                <h3>From YouTube</h3>
                <div className="audio-input-group">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube URL (video, Shorts, youtu.be)"
                    disabled={isLoadingAudio || !!audioMetadata}
                    className="youtube-input"
                  />
                  <button
                    onClick={extractYoutubeAudio}
                    disabled={!youtubeUrl || isLoadingAudio || !!audioMetadata}
                    className="btn btn-secondary"
                  >
                    {isLoadingAudio ? '⏳ Extracting...' : '🔗 Extract'}
                  </button>
                </div>
              </div>

              {/* File Upload Option */}
              {!audioMetadata && (
                <div className="audio-option">
                  <h3>Or Upload File</h3>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      style={{ display: 'none' }}
                    />
                    📁 Choose MP3, WAV, M4A, etc.
                  </label>
                  <small>Max 100MB</small>
                </div>
              )}

              {/* Audio Selected */}
              {audioMetadata && (
                <div className="audio-selected">
                  {audioMetadata.thumbnail && (
                    <img src={audioMetadata.thumbnail} alt={audioMetadata.title} />
                  )}
                  <div className="audio-info">
                    <h4>{audioMetadata.title}</h4>
                    <p>✓ Audio selected</p>
                    <p className="duration">
                      ⏱️ Duration: {formatDuration(audioMetadata.duration)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAudioMetadata(null);
                      setYoutubeUrl('');
                      setAudioFile(null);
                    }}
                    className="btn-clear"
                    title="Remove audio"
                  >
                    ✕
                  </button>
                </div>
              )}

              {audioError && <div className="error-message">⚠️ {audioError}</div>}
            </div>
          )}
        </section>

        {/* STEP 4: BACKGROUND IMAGES (OPTIONAL) */}
        <section className="media-section optional">
          <div className="section-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useCustomImages}
                onChange={(e) => setUseCustomImages(e.target.checked)}
              />
              <span>
                <h2>📸 Custom Background Images (Optional)</h2>
              </span>
            </label>
            <span className="badge">Optional</span>
          </div>
          <p className="section-description">Use your own images or auto-select from theme</p>

          {useCustomImages && (
            <div className="optional-content">
              <div className="placeholder-box">
                <p>📌 Choose theme or upload custom images</p>
                <p>Options available in composition step</p>
                <p>If not selected, app will auto-pick beautiful images</p>
              </div>
            </div>
          )}
        </section>

        {/* SUMMARY */}
        <section className="media-summary">
          <h3>✅ Summary</h3>
          <div className="summary-items">
            <div className="summary-item">
              <span>📝 Quotes:</span>
              <span className={quotes.length > 0 ? 'ready' : 'pending'}>
                {quotes.length > 0 ? `✓ ${quotes.length} quotes ready` : '○ Not ready'}
              </span>
            </div>
            <div className="summary-item">
              <span>🎬 Videos:</span>
              <span className={useVideos ? 'pending' : 'optional'}>
                {useVideos ? '○ Will add in next step' : '○ Not included'}
              </span>
            </div>
            <div className="summary-item">
              <span>🎵 Audio:</span>
              <span className={audioMetadata ? 'ready' : useAudio ? 'pending' : 'optional'}>
                {audioMetadata ? `✓ ${audioMetadata.title}` : useAudio ? '○ Extracting...' : '○ Not included'}
              </span>
            </div>
            <div className="summary-item">
              <span>📸 Images:</span>
              <span className={useCustomImages ? 'pending' : 'optional'}>
                {useCustomImages ? '○ Custom upload' : '○ Auto-select'}
              </span>
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="media-actions">
          {onUseOldWorkflow && (
            <button
              className="btn btn-secondary"
              onClick={onUseOldWorkflow}
              style={{ marginRight: '12px' }}
            >
              ← Use Classic Workflow
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={quotes.length === 0}
            onClick={() => handleQuotesReady(quotes)}
          >
            Next: Composition & Timing →
          </button>
          {quotes.length === 0 && (
            <p className="hint">👆 Add quotes first to continue</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .media-input-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .media-input-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .media-input-header h1 {
          margin: 0 0 10px;
          font-size: 32px;
          font-weight: 700;
        }

        .media-input-header p {
          margin: 0;
          opacity: 0.7;
          font-size: 16px;
        }

        .media-input-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .media-section {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          background: white;
          transition: all 0.3s ease;
        }

        .media-section.required {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .media-section.optional {
          border-color: #d1d5db;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;
        }

        .checkbox-label input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .badge {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          background: #f3f4f6;
          color: #6b7280;
        }

        .badge.required-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .section-description {
          margin: 0;
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 16px;
        }

        .optional-content {
          margin-top: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
        }

        .info-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .info-box p {
          margin: 0 0 6px;
          font-size: 13px;
        }

        .info-box p:last-child {
          margin-bottom: 0;
        }

        .placeholder-box {
          padding: 24px;
          text-align: center;
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .placeholder-box p {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .placeholder-box small {
          opacity: 0.6;
          font-size: 12px;
        }

        .audio-option {
          margin-bottom: 20px;
        }

        .audio-option h3 {
          margin: 0 0 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .audio-input-group {
          display: flex;
          gap: 10px;
        }

        .youtube-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .youtube-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .file-input-label {
          display: block;
          padding: 16px;
          text-align: center;
          border: 2px dashed #3b82f6;
          border-radius: 8px;
          cursor: pointer;
          color: #3b82f6;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .file-input-label:hover {
          background: #f0f9ff;
        }

        .file-input-label small {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-top: 6px;
          font-weight: 400;
        }

        .audio-selected {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #10b981;
        }

        .audio-selected img {
          width: 60px;
          height: 60px;
          border-radius: 4px;
          object-fit: cover;
        }

        .audio-info {
          flex: 1;
        }

        .audio-info h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .audio-info p {
          margin: 0 0 2px;
          font-size: 12px;
          opacity: 0.7;
        }

        .audio-info .duration {
          color: #059669;
          font-weight: 600;
        }

        .btn-clear {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 50%;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-clear:hover {
          background: #fecaca;
        }

        .error-message {
          padding: 10px;
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #dc2626;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 13px;
        }

        .media-summary {
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 20px;
          background: #f0fdf4;
        }

        .media-summary h3 {
          margin: 0 0 16px;
          font-size: 16px;
        }

        .summary-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 13px;
        }

        .summary-item span:first-child {
          font-weight: 600;
          opacity: 0.7;
        }

        .summary-item .ready {
          color: #10b981;
          font-weight: 600;
        }

        .summary-item .pending {
          color: #f59e0b;
          font-weight: 600;
        }

        .summary-item .optional {
          opacity: 0.6;
        }

        .media-actions {
          margin-top: 20px;
          text-align: center;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .btn.btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
        }

        .btn.btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .btn.btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn.btn-secondary {
          background: #f3f4f6;
          color: #1f2937;
        }

        .btn.btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .hint {
          margin-top: 10px;
          font-size: 13px;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .media-input-container {
            padding: 20px 10px;
          }

          .media-section {
            padding: 16px;
          }

          .audio-input-group {
            flex-direction: column;
          }

          .summary-items {
            grid-template-columns: 1fr;
          }
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
