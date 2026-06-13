//   src/utils/pinterestApi.js
//   Fetch public Pinterest board data via RSS feed.
//   Uses a Vite proxy (/pinterest-rss) in development.
//   In production, falls back to a public CORS proxy (allorigins) because GitHub Pages cannot host a custom proxy.
//   Now includes a short‑lived cache and exponential backoff
//   so repeated calls (auto‑refresh) are gentle and resilient.

import { logger } from './logger';

// ----- Determine which fetch endpoint to use -----
// In development, Vite proxies /pinterest-rss to Pinterest.
// In production, we must use a public CORS proxy.
const isDevelopment = import.meta.env.DEV;
const PROXY_BASE = isDevelopment
  ? '/pinterest-rss'
  : 'https://api.allorigins.win/raw?url=';

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

// ----- Helper: parse Pinterest board URL -----
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

// ----- Build the actual fetch URL (with or without proxy) -----
const buildFetchUrl = (username, boardName) => {
  const rssPath = `/${username}/${boardName}.rss`;
  if (isDevelopment) {
    // Use the Vite proxy
    return `${PROXY_BASE}${rssPath}`;
  } else {
    // Use a public CORS proxy. Encode the full Pinterest RSS URL.
    const fullPinterestUrl = `https://www.pinterest.com${rssPath}`;
    return `${PROXY_BASE}${encodeURIComponent(fullPinterestUrl)}`;
  }
};

// ----- Main board data fetcher (enhanced with cache & backoff & production proxy) -----
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

  // 2) Respect backoff – if recently failed, reuse expired cache or throw softly
  if (!shouldRetry(cacheKey)) {
    if (cached) {
      logger.debug(`Backoff active for "${cacheKey}", serving stale cache`);
      return cached;
    }
    logger.debug(`Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  // 3) Build the fetch URL (development proxy or production CORS proxy)
  const fetchUrl = buildFetchUrl(username, boardName);
  logger.debug(`Fetching RSS feed from: ${fetchUrl}`);

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 s timeout

    response = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    logger.debug(`RSS response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    logger.error('Failed to fetch RSS feed:', err);
    recordFailure(cacheKey);
    if (cached) {
      logger.debug('Serving stale cache after fetch error');
      return cached;
    }
    throw new Error(`Unable to load board RSS feed: ${err.message}`);
  }

  // 4) Get response text (allorigins returns the raw RSS, but may wrap in JSON? Actually allorigins.win/raw?url= returns the raw content)
  let xmlText;
  try {
    xmlText = await response.text();
    logger.debug(`RSS feed length: ${xmlText.length} characters`);
  } catch (err) {
    logger.error('Failed to read response text:', err);
    recordFailure(cacheKey);
    if (cached) return cached;
    throw new Error('Failed to read board data');
  }

  // 5) Parse XML
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

  // 6) Cache successful response + reset backoff
  setCache(cacheKey, result);
  resetBackoff(cacheKey);

  return result;
};

// ----- Random image selector -----
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};