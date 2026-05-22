//   src/utils/pinterestApi.js
//   Fetch public Pinterest board data via RSS feed.
//   Uses a Vite proxy (/pinterest-rss) to avoid CORS issues.
//   Now includes a short‑lived cache and exponential backoff
//   so repeated calls (auto‑refresh) are gentle and resilient.

import { logger } from './logger';

// ----- Simple in‑memory cache for the RSS data -----
// cache entries expire after 2 minutes (120000 ms)
const cache = new Map();
const CACHE_TTL = 120000; // 2 min

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ----- Backoff helper for retrying after failures -----
// stores the next attempt time per board URL (by normalized key)
const retryTimers = new Map();
const BACKOFF_BASE = 5000; // 5 seconds
const BACKOFF_MAX = 60000; // 1 minute

const shouldRetry = (key) => {
  const next = retryTimers.get(key) || 0;
  return Date.now() >= next;
};

const recordFailure = (key) => {
  const prev = retryTimers.get(key) || 0;
  const delay = Math.min((prev ? (Date.now() - prev) * 2 : BACKOFF_BASE), BACKOFF_MAX);
  retryTimers.set(key, Date.now() + delay);
};

const resetBackoff = (key) => {
  retryTimers.delete(key);
};

// ----- Helper: parse Pinterest board URL (unchanged) -----
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

// ----- Helper: parse XML text into a Document (unchanged) -----
const parseXML = (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`XML parse error: ${errorNode.textContent}`);
  }
  return doc;
};

// ----- Helper: extract image URLs from RSS item descriptions (unchanged) -----
const extractImageUrlsFromItem = (item) => {
  const descElement = item.querySelector('description');
  if (!descElement) return [];

  const htmlContent = descElement.textContent;
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  const matches = [];
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// ----- Main board data fetcher (enhanced with cache & backoff) -----
export const fetchBoardData = async (boardUrl) => {
  logger.debug(`fetchBoardData called with URL: ${boardUrl}`);

  const parsed = parseBoardUrl(boardUrl);
  if (!parsed) {
    throw new Error('Invalid Pinterest board URL. Expected format: https://www.pinterest.com/username/board-name/');
  }
  const { username, boardName } = parsed;
  const cacheKey = `${username}/${boardName}`;

  // 1) Return cached data if available and fresh
  const cached = getCached(cacheKey);
  if (cached) {
    logger.debug(`Using cached data for "${cacheKey}"`);
    return cached;
  }

  // 2) respect backoff – if recently failed, reuse expired cache or throw softly
  if (!shouldRetry(cacheKey)) {
    // if have expired cache , serve it as a fallback
    if (cached) {
      logger.debug(`Backoff active for "${cacheKey}", serving stale cache`);
      return cached;
    }
    logger.debug(`Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  // 3) build RSS feed URL and fetch with a short timeout
  const rssUrl = `/pinterest-rss/${username}/${boardName}.rss`;
  logger.debug(`Fetching RSS feed from: ${rssUrl}`);

  let xmlText;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 s timeout

    const response = await fetch(rssUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    logger.debug(`RSS response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    xmlText = await response.text();
    logger.debug(`RSS feed length: ${xmlText.length} characters`);
  } catch (err) {
    logger.error('Failed to fetch RSS feed:', err);
    recordFailure(cacheKey);
    // if we have stale cache, use it even on fetch error
    if (cached) {
      logger.debug('Serving stale cache after fetch error');
      return cached;
    }
    throw new Error(`Unable to load board RSS feed: ${err.message}`);
  }

  // 4) parse XML
  let doc;
  try {
    doc = parseXML(xmlText);
  } catch (err) {
    logger.error('XML parsing failed:', err);
    recordFailure(cacheKey);
    if (cached) return cached;
    throw new Error(`RSS feed could not be parsed: ${err.message}`);
  }

  const channelTitle = doc.querySelector('channel > title');
  const boardTitle = channelTitle
    ? channelTitle.textContent.trim()
    : boardName;
  logger.debug(`Board title: "${boardTitle}"`);

  const items = doc.querySelectorAll('item');
  logger.debug(`Found ${items.length} items in RSS feed`);
  if (items.length === 0) {
    recordFailure(cacheKey);
    if (cached) return cached;
    throw new Error('The board appears to be empty or not public.');
  }

  const allImageUrls = [];
  items.forEach((item, index) => {
    const imgs = extractImageUrlsFromItem(item);
    logger.debug(`Item ${index + 1}: extracted ${imgs.length} image(s)`);
    allImageUrls.push(...imgs);
  });

  const pinImages = allImageUrls
    .filter(url => url.includes('pinimg.com'))
    .filter((url, idx, arr) => arr.indexOf(url) === idx);

  logger.debug(`Total unique Pinterest images found: ${pinImages.length}`);
  if (pinImages.length === 0) {
    recordFailure(cacheKey);
    if (cached) return cached;
    throw new Error('No pin images found in the RSS feed. The board may be empty or private.');
  }

  const result = { title: boardTitle, pinImages };

  // 5) cache successful response + reset backoff
  setCache(cacheKey, result);
  resetBackoff(cacheKey);

  return result;
};

// ----- Random image selector (unchanged) -----
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};