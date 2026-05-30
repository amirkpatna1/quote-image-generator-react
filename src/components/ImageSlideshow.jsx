import React, { useState } from 'react';

export default function ImageSlideshow({
  images = [],
  duration = 5,
  transitionEffect = 'fade',
  onSettingsChange,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [effectSettings, setEffectSettings] = useState({
    zoomLevel: 1.2,
    panSpeed: 1,
    rotationDegrees: 0,
    blurLevel: 0,
    brightnessLevel: 1,
  });

  const effects = [
    { id: 'fade', name: 'Fade', icon: '⚪' },
    { id: 'slide-left', name: 'Slide Left', icon: '←' },
    { id: 'slide-right', name: 'Slide Right', icon: '→' },
    { id: 'zoom', name: 'Zoom In', icon: '🔍' },
    { id: 'pan', name: 'Pan', icon: '↔️' },
    { id: 'rotate', name: 'Rotate', icon: '🔄' },
    { id: 'blur-focus', name: 'Blur to Focus', icon: '✨' },
    { id: 'flip', name: 'Flip', icon: '🔀' },
  ];

  const handleEffectChange = (effect) => {
    onSettingsChange?.({
      transitionEffect: effect,
      effectSettings,
    });
  };

  const handleSettingChange = (key, value) => {
    const updated = { ...effectSettings, [key]: value };
    setEffectSettings(updated);
    onSettingsChange?.({
      transitionEffect,
      effectSettings: updated,
    });
  };

  const getAnimationStyle = () => {
    const baseStyle = {
      animation: `${transitionEffect} ${duration}s ease-in-out infinite`,
      transformOrigin: 'center',
    };

    switch (transitionEffect) {
      case 'zoom':
        return {
          ...baseStyle,
          animation: `slideZoom ${duration}s ease-in-out infinite`,
        };
      case 'pan':
        return {
          ...baseStyle,
          animation: `slidePan ${duration}s ease-in-out infinite`,
        };
      case 'rotate':
        return {
          ...baseStyle,
          animation: `slideRotate ${duration}s ease-in-out infinite`,
        };
      case 'blur-focus':
        return {
          ...baseStyle,
          animation: `blurFocus ${duration}s ease-in-out infinite`,
          filter: `blur(${effectSettings.blurLevel}px)`,
        };
      case 'flip':
        return {
          ...baseStyle,
          animation: `slideFlip ${duration}s ease-in-out infinite`,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="image-slideshow">
      <div className="slideshow-header">
        <h3>📸 Image Slideshow Effects</h3>
        <p>Choose how images transition and animate during playback</p>
      </div>

      <div className="effects-grid">
        {effects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => handleEffectChange(effect.id)}
            className={`effect-button ${transitionEffect === effect.id ? 'active' : ''}`}
            title={effect.name}
          >
            <span className="effect-icon">{effect.icon}</span>
            <span className="effect-name">{effect.name}</span>
          </button>
        ))}
      </div>

      {/* Effect-specific settings */}
      {transitionEffect === 'zoom' && (
        <div className="effect-settings">
          <label>
            <span>Zoom Level:</span>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={effectSettings.zoomLevel}
              onChange={(e) => handleSettingChange('zoomLevel', parseFloat(e.target.value))}
            />
            <span className="value">{effectSettings.zoomLevel.toFixed(1)}x</span>
          </label>
        </div>
      )}

      {transitionEffect === 'pan' && (
        <div className="effect-settings">
          <label>
            <span>Pan Speed:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={effectSettings.panSpeed}
              onChange={(e) => handleSettingChange('panSpeed', parseFloat(e.target.value))}
            />
            <span className="value">{effectSettings.panSpeed.toFixed(1)}x</span>
          </label>
        </div>
      )}

      {transitionEffect === 'rotate' && (
        <div className="effect-settings">
          <label>
            <span>Rotation:</span>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={effectSettings.rotationDegrees}
              onChange={(e) => handleSettingChange('rotationDegrees', parseFloat(e.target.value))}
            />
            <span className="value">{effectSettings.rotationDegrees}°</span>
          </label>
        </div>
      )}

      {transitionEffect === 'blur-focus' && (
        <div className="effect-settings">
          <label>
            <span>Blur Amount:</span>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={effectSettings.blurLevel}
              onChange={(e) => handleSettingChange('blurLevel', parseInt(e.target.value))}
            />
            <span className="value">{effectSettings.blurLevel}px</span>
          </label>
        </div>
      )}

      {/* Preview */}
      {images.length > 0 && (
        <div className="preview-section">
          <h4>Preview</h4>
          <div className="preview-container">
            <div className="preview-image" style={getAnimationStyle()}>
              <img
                src={images[currentIndex] || '/placeholder.png'}
                alt={`Slide ${currentIndex + 1}`}
              />
            </div>
            <div className="preview-controls">
              <button onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}>
                ← Prev
              </button>
              <span className="slide-counter">
                {currentIndex + 1} / {images.length}
              </span>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}>
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .image-slideshow {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          color: white;
        }

        .slideshow-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .slideshow-header p {
          margin: 0 0 15px 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .effects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .effect-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .effect-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .effect-button.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .effect-icon {
          font-size: 24px;
        }

        .effect-name {
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        .effect-settings {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .effect-settings label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .effect-settings input[type="range"] {
          flex: 1;
          max-width: 200px;
        }

        .effect-settings .value {
          font-weight: 600;
          min-width: 50px;
          text-align: right;
        }

        .preview-section {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 8px;
        }

        .preview-section h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-image {
          width: 100%;
          aspect-ratio: 16/9;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .preview-controls button {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid white;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .preview-controls button:hover {
          background: white;
          color: #4facfe;
        }

        .slide-counter {
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
        }

        /* Animation keyframes */
        @keyframes fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes slideZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes slidePan {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }

        @keyframes slideRotate {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes blurFocus {
          0%, 100% { filter: blur(10px); }
          50% { filter: blur(0px); }
        }

        @keyframes slideFlip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }

        @keyframes slideLeft {
          0% { transform: translateX(100%); opacity: 0; }
          50% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }

        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
