import '../styles/MediaInput.css';
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

      
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
