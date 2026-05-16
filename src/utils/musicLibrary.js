// Royalty-free music library
// Note: For production, integrate with Pixabay Music API, Freepik, or YouTube Audio Library
// For now, we focus on user uploads which is the most flexible option

export const MUSIC_CATEGORIES = [
  'ambient',
  'background',
  'chill',
  'corporate',
  'energetic',
  'happy',
  'inspiring',
  'peaceful',
  'upbeat',
  'cinematic',
];

// Placeholder: Return empty library by default
// Users should upload their own music or use:
// - Pixabay Music (pixabay.com/music)
// - YouTube Audio Library (youtube.com/audio_library)
// - Freepik (freepik.com/premium/music)
// - Bensound (bensound.com)
// - Free Music Archive (freemusicarchive.org)
export async function searchRoyaltyFreeMusic(query, limit = 12) {
  try {
    // Returns empty array - users should use upload feature instead
    // In production, this would call an actual music API
    return [];
  } catch (error) {
    console.error('Music search error:', error);
    return [];
  }
}

export async function loadAudioFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load audio: ${response.status}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Audio load error:', error);
    return null;
  }
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
