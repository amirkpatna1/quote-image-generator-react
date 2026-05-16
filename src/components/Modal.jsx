import { useEffect, useRef } from 'react';

export default function Modal({ canvas, onClose }) {
  const ref = useRef();

  useEffect(() => {
    if (!canvas || !ref.current) return;
    ref.current.width  = canvas.width;
    ref.current.height = canvas.height;
    ref.current.getContext('2d').drawImage(canvas, 0, 0);
  }, [canvas]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (canvas) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canvas, onClose]);

  if (!canvas) return null;

  function download() {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'quotify-image.png';
    a.click();
  }

  return (
    <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && onClose()}>
      <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">✕</button>
      <div className="modal-box">
        <canvas ref={ref} />
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={download}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
            </svg>
            Download PNG
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
