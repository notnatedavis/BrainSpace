//   src/utils/pinterestApi.js
//   Fetch public Pinterest board data via RSS feed.
//   Uses Vite proxy in development, AllOrigins CORS proxy in production.
//   Includes cache, exponential backoff, and stale‑cache fallback.

import { logger } from './logger';

// ----- Simple in‑memory cache -----
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

// ----- Backoff helper -----
const retryTimers = new Map();
const BACKOFF_BASE = 5000;
const BACKOFF_MAX = 60000;

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

// ----- Parse board URL -----
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

// ----- XML parsing helpers -----
const parseXML = (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`XML parse error: ${errorNode.textContent}`);
  }
  return doc;
};

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

// ----- Production CORS proxy (AllOrigins) -----
const fetchViaCorsProxy = async (url) => {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`CORS proxy returned ${response.status}`);
  }
  return response.text();
};

// ----- Main board data fetcher (production‑aware) -----
export const fetchBoardData = async (boardUrl) => {
  logger.debug(`fetchBoardData called with URL: ${boardUrl}`);

  const parsed = parseBoardUrl(boardUrl);
  if (!parsed) {
    throw new Error('Invalid Pinterest board URL. Expected format: https://www.pinterest.com/username/board-name/');
  }
  const { username, boardName } = parsed;
  const cacheKey = `${username}/${boardName}`;
  const cached = getCached(cacheKey);

  // 1) Return fresh cache if available
  if (cached) {
    logger.debug(`Using cached data for "${cacheKey}"`);
    return cached;
  }

  // 2) Respect backoff – if recently failed, serve stale cache or throw
  if (!shouldRetry(cacheKey)) {
    if (cached) {
      logger.debug(`Backoff active for "${cacheKey}", serving stale cache`);
      return cached;
    }
    logger.debug(`Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  // 3) Construct absolute RSS URL
  const rssUrl = `https://www.pinterest.com/${username}/${boardName}.rss`;
  logger.debug(`RSS URL: ${rssUrl}`);

  let xmlText;
  try {
    // Decide fetch method based on environment
    if (import.meta.env.PROD) {
      logger.debug('Production environment – using CORS proxy (AllOrigins)');
      xmlText = await fetchViaCorsProxy(rssUrl);
    } else {
      logger.debug('Development environment – using Vite proxy');
      const proxyUrl = `/pinterest-rss/${username}/${boardName}.rss`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      xmlText = await response.text();
    }
    logger.debug(`RSS feed length: ${xmlText.length} characters`);
  } catch (err) {
    logger.error('Failed to fetch RSS feed:', err);
    recordFailure(cacheKey);
    if (cached) {
      logger.debug('Serving stale cache after fetch error');
      return cached;
    }
    throw new Error(`Unable to load board RSS feed: ${err.message}`);
  }

  // 4) Parse XML
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

  setCache(cacheKey, result);
  resetBackoff(cacheKey);

  return result;
};

// ----- Random image selector (unchanged) -----
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};