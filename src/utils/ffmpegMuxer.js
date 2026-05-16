import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;
let ffmpegReady = false;

async function initFFmpeg() {
  if (ffmpegReady) return ffmpeg;
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
  }

  if (!ffmpeg.loaded) {
    // Load FFmpeg from CDN
    await ffmpeg.load({
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    });
  }

  ffmpegReady = true;
  return ffmpeg;
}

export async function muxVideoWithAudio(
  videoBlob,
  audioBlob,
  onProgress = null
) {
  try {
    const ff = await initFFmpeg();

    // Write files to FFmpeg virtual filesystem
    if (onProgress) onProgress(10);
    await ff.writeFile('video.mp4', await fetchFile(videoBlob));

    if (onProgress) onProgress(20);
    await ff.writeFile('audio.mp3', await fetchFile(audioBlob));

    // Run FFmpeg command to mux video + audio
    if (onProgress) onProgress(30);
    await ff.exec([
      '-i', 'video.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',           // Copy video codec (don't re-encode)
      '-c:a', 'aac',            // Encode audio to AAC
      '-shortest',              // Use shortest stream duration
      '-y',                      // Overwrite output
      'output.mp4'
    ]);

    if (onProgress) onProgress(80);

    // Read output file
    const data = await ff.readFile('output.mp4');
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    if (onProgress) onProgress(90);

    // Clean up
    ff.deleteFile('video.mp4');
    ff.deleteFile('audio.mp3');
    ff.deleteFile('output.mp4');

    if (onProgress) onProgress(100);

    return outputBlob;
  } catch (error) {
    console.error('FFmpeg muxing error:', error);
    throw new Error(`Audio muxing failed: ${error.message}`);
  }
}

export async function isFFmpegReady() {
  try {
    await initFFmpeg();
    return true;
  } catch {
    return false;
  }
}
