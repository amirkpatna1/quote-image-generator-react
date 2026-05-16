import { drawQuoteOnCanvas } from './canvasRenderer';
import { getCanvasSize } from './canvasSizes';
import { processAudioForVideo, audioBufferToWav } from './audioProcessor';
import { loadAudioFile } from './musicLibrary';
import { muxVideoWithAudio } from './ffmpegMuxer';

function getPerSlideConfig(baseConfig, slide, size) {
  const { W, H } = getCanvasSize(size);
  return {
    W,
    H,
    ...baseConfig,
    ...(slide.layoutTemplate ? { layoutTemplate: slide.layoutTemplate } : {}),
    ...(slide.textAlign ? { textAlign: slide.textAlign } : {}),
    ...(slide.bgType ? { bgType: slide.bgType } : {}),
    ...(slide.overlay_color ? { overlayColor: slide.overlay_color } : {}),
  };
}

export function renderSlideCanvas(slide, index, baseConfig, size, bgImage) {
  const canvas = document.createElement('canvas');
  drawQuoteOnCanvas(canvas, slide, index, getPerSlideConfig(baseConfig, slide, size), bgImage ?? null);
  return canvas;
}

export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not export canvas.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isMp4ExportSupported() {
  return typeof window !== 'undefined'
    && 'VideoEncoder' in window
    && 'VideoFrame' in window;
}

async function getSupportedVideoEncoderConfig(width, height, fps) {
  const candidates = [
    {
      codec: 'avc1.42001f',
      width,
      height,
      bitrate: 5_000_000,
      framerate: fps,
      avc: { format: 'avc' },
      hardwareAcceleration: 'prefer-hardware',
    },
    {
      codec: 'avc1.4d0028',
      width,
      height,
      bitrate: 7_000_000,
      framerate: fps,
      avc: { format: 'avc' },
      hardwareAcceleration: 'prefer-hardware',
    },
  ];

  for (const candidate of candidates) {
    try {
      const support = await VideoEncoder.isConfigSupported(candidate);
      if (support?.supported) return support.config;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error('This browser cannot encode H.264 MP4 video. Use a recent Chrome or Edge build.');
}

export async function encodeSlidesToMp4({
  slides,
  baseConfig,
  size,
  fps,
  secondsPerSlide,
  resolveBgImage,
  onProgress,
  music = null,
  musicVolume = 1.0,
  musicFadeIn = 0,
  musicFadeOut = 0,
  videoDuration = null,
}) {
  if (!isMp4ExportSupported()) {
    throw new Error('MP4 export requires WebCodecs support. Use a recent Chrome or Edge build.');
  }

  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const { W, H } = getCanvasSize(size);
  const encoderConfig = await getSupportedVideoEncoderConfig(W, H, fps);
  const target = new ArrayBufferTarget();

  // Calculate total video duration
  const totalDuration = videoDuration || slides.length * secondsPerSlide;

  // Prepare muxer (video only for now - audio support coming soon)
  const muxerConfig = {
    target,
    video: {
      codec: 'avc',
      width: W,
      height: H,
      frameRate: fps,
    },
    fastStart: 'in-memory',
  };

  const muxer = new Muxer(muxerConfig);

  let encodingError = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (error) => { encodingError = error; },
  });
  encoder.configure(encoderConfig);

  const slideDurationUs = Math.round(secondsPerSlide * 1_000_000);
  let timestamp = 0;

  for (let index = 0; index < slides.length; index++) {
    if (encodingError) throw encodingError;

    const slide = slides[index];
    const canvas = renderSlideCanvas(slide, index, baseConfig, size, resolveBgImage(slide, index));
    const frame = new VideoFrame(canvas, { timestamp, duration: slideDurationUs });
    encoder.encode(frame, { keyFrame: true });
    frame.close();
    timestamp += slideDurationUs;
    if (onProgress) onProgress(Math.round(((index + 1) / slides.length) * 50)); // 0-50% for video
  }

  await encoder.flush();
  if (encodingError) throw encodingError;
  encoder.close();
  muxer.finalize();

  const videoBlob = new Blob([target.buffer], { type: 'video/mp4' });

  // Mux audio if provided
  if (music) {
    try {
      if (onProgress) onProgress(50); // Video done, audio muxing starts

      let audioArrayBuffer = null;

      // Load audio from URL or use uploaded buffer
      if (music.source === 'library' && music.url) {
        audioArrayBuffer = await loadAudioFile(music.url);
      } else if (music.source === 'upload' && music.arrayBuffer) {
        audioArrayBuffer = music.arrayBuffer;
      }

      if (audioArrayBuffer) {
        // Process audio (fade, volume, etc.)
        const processedAudio = await processAudioForVideo(
          audioArrayBuffer,
          totalDuration,
          musicVolume,
          musicFadeIn,
          musicFadeOut
        );

        if (processedAudio) {
          // Convert processed audio to blob for FFmpeg
          const audioBlob = new Blob([audioBufferToWav(processedAudio)], { type: 'audio/wav' });

          if (onProgress) onProgress(60);

          // Use FFmpeg to mux video + audio
          const finalBlob = await muxVideoWithAudio(
            videoBlob,
            audioBlob,
            (progress) => {
              // Map FFmpeg progress (0-100) to our progress range (60-95)
              const mappedProgress = 60 + (progress * 0.35);
              if (onProgress) onProgress(Math.floor(mappedProgress));
            }
          );

          if (onProgress) onProgress(100);
          return finalBlob;
        }
      }

      if (onProgress) onProgress(100);
    } catch (audioError) {
      console.warn('Audio muxing failed, returning video-only:', audioError);
      if (onProgress) onProgress(100);
    }
  } else {
    if (onProgress) onProgress(100);
  }

  return videoBlob;
}
