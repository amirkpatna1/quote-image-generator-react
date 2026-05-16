import { useState, useRef, useEffect } from 'react';
import { searchRoyaltyFreeMusic, formatDuration } from '../utils/musicLibrary';

export default function MusicSelector({
  selectedMusic,
  onMusicSelect,
  videoDuration,
  volume,
  onVolumeChange,
  fadeIn,
  onFadeInChange,
  fadeOut,
  onFadeOutChange,
}) {
  const [mode, setMode] = useState('none'); // 'none', 'upload', 'library'
  const [libraryMusic, setLibraryMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAudio, setPreviewAudio] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (mode === 'library' && libraryMusic.length === 0) {
      loadLibraryMusic();
    }
  }, [mode]);

  async function loadLibraryMusic() {
    setLoading(true);
    const music = await searchRoyaltyFreeMusic('', 12);
    setLibraryMusic(music);
    setLoading(false);
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      const results = await searchRoyaltyFreeMusic(query);
      setLibraryMusic(results);
      setLoading(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer) {
        onMusicSelect({
          source: 'upload',
          name: file.name,
          duration: 0, // Will be calculated during processing
          arrayBuffer,
          blob: file,
        });
        setMode('none');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleSelectLibrary(music) {
    onMusicSelect({
      source: 'library',
      name: music.title,
      duration: music.duration,
      url: music.url,
      artist: music.artist,
    });
    setMode('none');
  }

  function playPreview(url) {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setPreviewAudio(url);
    }
  }

  function stopPreview() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPreviewAudio(null);
    }
  }

  return (
    <div className="music-selector" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '1.2rem', marginRight: 8 }}>🎵</span>
        <strong>Background Music (Optional)</strong>
      </div>

      {/* Selected Music Display */}
      {selectedMusic ? (
        <div
          style={{
            padding: 12,
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{selectedMusic.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedMusic.artist && `by ${selectedMusic.artist} • `}
                {selectedMusic.source === 'library' ? 'Royalty-free' : 'Uploaded'}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                onMusicSelect(null);
                stopPreview();
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {/* Volume */}
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                style={{ width: '100%', marginTop: 6 }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {Math.round(volume * 100)}%
              </div>
            </div>

            {/* Fade In */}
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Fade In</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={fadeIn}
                onChange={(e) => onFadeInChange(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6 }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {fadeIn.toFixed(1)}s
              </div>
            </div>

            {/* Fade Out */}
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Fade Out</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={fadeOut}
                onChange={(e) => onFadeOutChange(Number(e.target.value))}
                style={{ width: '100%', marginTop: 6 }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {fadeOut.toFixed(1)}s
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 10 }}>
            Video duration: {videoDuration}s • Audio will loop/trim to match
          </div>
        </div>
      ) : null}

      {/* Mode Selection */}
      <div className="ai-mode-tabs" style={{ marginBottom: 12 }}>
        <button
          className={`ai-mode-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode(mode === 'upload' ? 'none' : 'upload')}
        >
          <strong>📁 Upload Audio</strong>
          <span>Use your own MP3, WAV, or M4A file</span>
        </button>
        <button
          className={`ai-mode-tab ${mode === 'library' ? 'active' : ''}`}
          onClick={() => setMode(mode === 'library' ? 'none' : 'library')}
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
          title="Library requires API setup. Upload your own music instead!"
        >
          <strong>🎶 Royalty-Free Library</strong>
          <span>Requires API configuration (coming soon)</span>
        </button>
      </div>

      {/* Upload Section */}
      {mode === 'upload' && (
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 12 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: 24,
              border: '2px dashed var(--border)',
              borderRadius: 8,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎧</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop audio file here</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              or click to browse (MP3, WAV, M4A)
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Library Section */}
      {mode === 'library' && (
        <div style={{ padding: 24, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎵</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Library Coming Soon</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            The royalty-free music library requires API setup. For now, use the upload feature instead!
          </p>
          <div style={{
            padding: 12,
            background: 'var(--bg-primary)',
            borderRadius: 6,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'left',
            marginBottom: 12
          }}>
            <strong style={{ color: 'var(--text)' }}>Free music sources:</strong>
            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
              <li>Pixabay Music (pixabay.com/music)</li>
              <li>YouTube Audio Library</li>
              <li>Bensound (bensound.com)</li>
              <li>Free Music Archive</li>
            </ul>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setMode('upload')}
          >
            ↪ Switch to Upload
          </button>
        </div>
      )}

      <audio ref={audioRef} crossOrigin="anonymous" />
    </div>
  );
}
