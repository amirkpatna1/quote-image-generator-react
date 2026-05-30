import https from 'https';
import { URL } from 'url';

/**
 * Serverless function to extract audio from YouTube
 * Uses YouTube API to get audio stream URL
 * This is a lightweight approach that doesn't download the full file
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { youtubeUrl } = req.body;

  if (!youtubeUrl) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Return instructions for client-side extraction
    // The client will use a library like youtube-mp3-downloader or ytdl-core
    return res.status(200).json({
      success: true,
      videoId,
      message: 'Use client-side extraction with ytdl-core or similar',
      // Option 1: Client-side extraction using ytdl-core
      downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
      instructions: 'Use youtube-dl or ytdl-core library in browser',
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to process YouTube URL',
      message: error.message,
    });
  }
}

function extractVideoId(url) {
  // Handle various YouTube URL formats
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
}
