// Audio processing: decode, fade, trim, and prepare audio for muxing

export async function decodeAudioData(arrayBuffer, audioContext) {
  try {
    return await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch (error) {
    console.error('Audio decode error:', error);
    return null;
  }
}

export async function processAudioForVideo(
  audioArrayBuffer,
  videoDurationSeconds,
  volume = 1.0,
  fadeInSeconds = 0.5,
  fadeOutSeconds = 0.5
) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Decode audio
    const audioBuffer = await decodeAudioData(audioArrayBuffer, audioContext);
    if (!audioBuffer) return null;

    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;

    // Calculate total samples needed for video duration
    const totalSamples = Math.floor(videoDurationSeconds * sampleRate);

    // Create output buffer
    const outputBuffer = audioContext.createBuffer(numChannels, totalSamples, sampleRate);

    // Apply fade and volume to audio data
    for (let ch = 0; ch < numChannels; ch++) {
      const inputData = audioBuffer.getChannelData(ch);
      const outputData = outputBuffer.getChannelData(ch);

      const fadeInSamples = Math.floor(fadeInSeconds * sampleRate);
      const fadeOutSamples = Math.floor(fadeOutSeconds * sampleRate);

      for (let i = 0; i < totalSamples; i++) {
        const sourceIndex = i % inputData.length; // Loop audio if needed
        let sample = inputData[sourceIndex] * volume;

        // Apply fade in
        if (i < fadeInSamples) {
          sample *= i / fadeInSamples;
        }

        // Apply fade out
        if (i > totalSamples - fadeOutSamples) {
          sample *= (totalSamples - i) / fadeOutSamples;
        }

        outputData[i] = sample;
      }
    }

    return outputBuffer;
  } catch (error) {
    console.error('Audio processing error:', error);
    return null;
  }
}

export function audioBufferToWav(audioBuffer) {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const channelData = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  const interleaved = interleaveChannels(channelData);
  const dataLength = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  const volume = 1;
  for (let i = 0; i < interleaved.length; i++) {
    view.setInt16(offset, interleaved[i] < 0 ? interleaved[i] * 0x8000 : interleaved[i] * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function interleaveChannels(channels) {
  const length = channels[0].length * channels.length;
  const result = new Float32Array(length);
  let index = 0;

  for (let i = 0; i < channels[0].length; i++) {
    for (let ch = 0; ch < channels.length; ch++) {
      result[index++] = channels[ch][i];
    }
  }

  return result;
}
