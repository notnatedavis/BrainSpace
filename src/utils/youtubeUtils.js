// src/utils/youtubeUtils.js
// YouTube URL parsing utilities – shared between YoutubeTile and background feature

/**
 * Extract YouTube video ID from various URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Any URL containing these patterns.
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

/**
 * Validate and extract video ID, returning the ID or throwing an error.
 * @param {string} url - YouTube URL
 * @returns {string} Video ID
 * @throws {Error} If URL is invalid
 */
export const getValidatedYouTubeId = (url) => {
  const id = extractYouTubeId(url);
  if (!id) {
    throw new Error('Invalid YouTube URL. Use formats like: youtube.com/watch?v=... or youtu.be/...');
  }
  return id;
};