//   src/utils/pinterestApi.js
//   Fetch public Pinterest board data via RSS feed.
//   Uses a Vite proxy (/pinterest-rss) to avoid CORS issues.

import { logger } from './logger';

// ----- Helper: parse Pinterest board URL -----
/**
 * Extracts username and board name from a full board URL.
 * @param {string} boardUrl
 * @returns {{ username: string, boardName: string } | null}
 */
export const parseBoardUrl = (boardUrl) => {
  try {
    const url = new URL(boardUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length >= 2) {
      return {
        username: pathParts[0],
        boardName: pathParts[1],
      };
    }
    return null;
  } catch {
    return null;
  }
};

// ----- Helper: parse XML text into a Document -----
const parseXML = (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`XML parse error: ${errorNode.textContent}`);
  }
  return doc;
};

// ----- Helper: extract image URLs from RSS item descriptions -----
/**
 * Given an RSS item element, returns all image src URLs found in its <description>.
 * @param {Element} item - XML element for <item>
 * @returns {string[]}
 */
const extractImageUrlsFromItem = (item) => {
  const descElement = item.querySelector('description');
  if (!descElement) return [];

  const htmlContent = descElement.textContent; // XML stores escaped HTML as text
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  const matches = [];
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// ----- Main board data fetcher -----
/**
 * Fetches board title and a list of pin image URLs via the board’s RSS feed.
 * @param {string} boardUrl - Full Pinterest board URL.
 * @returns {Promise<{ title: string, pinImages: string[] }>}
 */
export const fetchBoardData = async (boardUrl) => {
  logger.debug(`fetchBoardData called with URL: ${boardUrl}`);

  const parsed = parseBoardUrl(boardUrl);
  if (!parsed) {
    throw new Error('Invalid Pinterest board URL. Expected format: https://www.pinterest.com/username/board-name/');
  }
  const { username, boardName } = parsed;
  logger.debug(`Parsed username: "${username}", boardName: "${boardName}"`);

  // Build RSS feed URL (works for public boards)
  const rssUrl = `/pinterest-rss/${username}/${boardName}.rss`;
  logger.debug(`Fetching RSS feed from: ${rssUrl}`);

  let xmlText;
  try {
    const response = await fetch(rssUrl);
    logger.debug(`RSS response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    xmlText = await response.text();
    logger.debug(`RSS feed length: ${xmlText.length} characters`);
  } catch (err) {
    logger.error('Failed to fetch RSS feed:', err);
    throw new Error(`Unable to load board RSS feed: ${err.message}`);
  }

  // Parse XML
  let doc;
  try {
    doc = parseXML(xmlText);
  } catch (err) {
    logger.error('XML parsing failed:', err);
    throw new Error(`RSS feed could not be parsed: ${err.message}`);
  }

  // Extract board title from <channel><title>
  const channelTitle = doc.querySelector('channel > title');
  const boardTitle = channelTitle
    ? channelTitle.textContent.trim()
    : boardName; // fallback to board name
  logger.debug(`Board title: "${boardTitle}"`);

  // Collect all image URLs from all items
  const items = doc.querySelectorAll('item');
  logger.debug(`Found ${items.length} items in RSS feed`);
  if (items.length === 0) {
    throw new Error('The board appears to be empty or not public.');
  }

  const allImageUrls = [];
  items.forEach((item, index) => {
    const imgs = extractImageUrlsFromItem(item);
    logger.debug(`Item ${index + 1}: extracted ${imgs.length} image(s)`);
    allImageUrls.push(...imgs);
  });

  // Filter to unique URLs and ensure they point to pinimg.com (Pinterest CDN)
  const pinImages = allImageUrls
    .filter(url => url.includes('pinimg.com'))
    .filter((url, idx, arr) => arr.indexOf(url) === idx);

  logger.debug(`Total unique Pinterest images found: ${pinImages.length}`);
  if (pinImages.length === 0) {
    throw new Error('No pin images found in the RSS feed. The board may be empty or private.');
  }

  return { title: boardTitle, pinImages };
};

// ----- Random image selector -----
/**
 * Picks a random image from the list.
 * @param {string[]} pinImages
 * @returns {string}
 */
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};