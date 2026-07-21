//   src/utils/pinterestApi.js

//   Fetch public Pinterest board data via RSS feed and static pin images via oEmbed.
//
//   In development (Vite) the dev‑server proxy /pinterest‑rss is used.
//   In production the fetcher is environment‑aware:
//     - If VITE_PINTEREST_PROXY is set, it uses that proxy (recommended).
//     - Otherwise it tries a list of public CORS proxies sequentially.
//
//   A short‑lived cache and exponential backoff keep repeated calls
//   (auto‑refresh) gentle and resilient.

import { logger } from './logger';
import { CORS_PROXY_URL } from '../config';

// ----- Simple in‑memory cache for the RSS data -----
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

// ----- retrying after failures -----
const retryTimers = new Map();
const BACKOFF_BASE = 5000;
const BACKOFF_MAX  = 60000;

const shouldRetry = (key) => {
  const next = retryTimers.get(key) || 0;
  return Date.now() >= next;
};

const recordFailure = (key) => {
  const prev = retryTimers.get(key) || 0;
  const delay = Math.min(
    prev ? (Date.now() - prev) * 2 : BACKOFF_BASE,
    BACKOFF_MAX
  );
  retryTimers.set(key, Date.now() + delay);
};

const resetBackoff = (key) => {
  retryTimers.delete(key);
};

// -----  parse Pinterest board URL -----
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

// ----- parse Pinterest pin URL -----
/**
 * Extracts the pin ID from a standard Pinterest pin URL
 * 
 * @param {string} pinUrl - e.g. "https://www.pinterest.com/pin/578360777206614341/"
 * @returns {string|null} pinId or null if invalid
 */
export const parsePinUrl = (pinUrl) => {
  try {
    const url = new URL(pinUrl);
    const parts = url.pathname.split('/').filter(p => p);
    if (parts.length >= 2 && parts[0] === 'pin') {
      return parts[1]; // pin id
    }
  } catch {
    // invalid URL
  }
  return null;
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

// ----- Environment‑aware RSS URL builder -----
const isDevEnvironment = () => {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

const buildRssUrl = (username, boardName) => {
  if (isDevEnvironment()) {
    return `/pinterest-rss/${username}/${boardName}.rss`;
  }
  return `https://www.pinterest.com/${username}/${boardName}.rss`;
};

// ----- Public CORS proxies -----
const PUBLIC_PROXIES = [
  {
    name: 'allorigins.win',
    buildUrl: (target) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  },
  {
    name: 'corsproxy.io',
    buildUrl: (target) =>
      `https://corsproxy.io/?${encodeURIComponent(target)}`,
  },
  {
    name: 'codetabs',
    buildUrl: (target) =>
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
  },
];

// ----- Generic fetch helper -----
const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetches text from a URL with a timeout
 */
const fetchWithTimeout = async (url, timeoutMs = FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Universal CORS proxy fetcher
 * 
 * If a custom proxy URL is set (CORS_PROXY_URL), it uses that directly
 * Otherwise it iterates over PUBLIC_PROXIES until one succeeds
 *
 * @param {string} targetUrl - The original URL you want to fetch (Pinterest RSS, oEmbed, etc.)
 * @returns {Promise<string>} response body text
 */
const fetchViaProxy = async (targetUrl) => {
  // 1) User‑supplied proxy
  if (CORS_PROXY_URL) {
    const proxyUrl = `${CORS_PROXY_URL}?${encodeURIComponent(targetUrl)}`;
    logger.debug(`Using custom proxy: ${proxyUrl}`);
    return await fetchWithTimeout(proxyUrl);
  }

  // 2) No custom proxy – try public ones
  logger.debug('No custom proxy configured, trying public proxies...');
  let lastError = null;

  for (const proxy of PUBLIC_PROXIES) {
    const proxyUrl = proxy.buildUrl(targetUrl);
    logger.debug(`Trying proxy "${proxy.name}": ${proxyUrl}`);

    try {
      const text = await fetchWithTimeout(proxyUrl);
      logger.debug(`Proxy "${proxy.name}" succeeded, response length: ${text.length}`);
      return text;
    } catch (err) {
      logger.warn(`Proxy "${proxy.name}" failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(
    `All public CORS proxies failed. Last error: ${lastError?.message}. ` +
    'Set VITE_PINTEREST_PROXY in your .env file to use your own proxy.'
  );
};

// ----- Board data fetcher (unchanged, uses fetchViaProxy for RSS) -----
export const fetchBoardData = async (boardUrl) => {
  logger.debug(`fetchBoardData called with URL: ${boardUrl}`);

  const parsed = parseBoardUrl(boardUrl);
  if (!parsed) {
    throw new Error(
      'Invalid Pinterest board URL. Expected format: https://www.pinterest.com/username/board-name/'
    );
  }
  const { username, boardName } = parsed;
  const cacheKey = `${username}/${boardName}`;

  // 1) Return cached data if available and fresh
  const cached = getCached(cacheKey);
  if (cached) {
    logger.debug(`Using cached data for "${cacheKey}"`);
    return cached;
  }

  // 2) Respect backoff
  if (!shouldRetry(cacheKey)) {
    if (cached) {
      logger.debug(`Backoff active for "${cacheKey}", serving stale cache`);
      return cached;
    }
    logger.debug(`Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  const rssUrl = buildRssUrl(username, boardName);
  logger.debug(`Raw RSS URL: ${rssUrl}`);

  let xmlText;
  try {
    if (isDevEnvironment()) {
      xmlText = await fetchWithTimeout(rssUrl);
    } else {
      xmlText = await fetchViaProxy(rssUrl);   // <-- reused proxy fetcher
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

// ----- fetch static pin image via oEmbed -----
/**
 * Fetches the static image URL (and optionally title) for a given Pinterest pin URL.
 * Uses Pinterest's oEmbed endpoint (`https://www.pinterest.com/oembed.json`).
 *
 * @param {string} pinUrl - e.g. "https://www.pinterest.com/pin/578360777206614341/"
 * @returns {Promise<{imageUrl: string, title: string}>}
 */
export const fetchPinImageData = async (pinUrl) => {
  const pinId = parsePinUrl(pinUrl);
  if (!pinId) {
    throw new Error('Invalid Pinterest pin URL. Expected format: https://www.pinterest.com/pin/.../');
  }

  const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(pinUrl)}`;
  logger.debug(`Fetching pin image data via oEmbed: ${oembedUrl}`);

  let responseText;
  try {
    if (isDevEnvironment()) {
      // In dev, oembed.json usually doesn't need proxy (CORS is OK), still use proxy if needed
      // try direct fetch first, if CORS error, fall back to proxy
      try {
        responseText = await fetchWithTimeout(oembedUrl);
      } catch (directErr) {
        logger.warn('Direct oEmbed fetch failed, trying proxy:', directErr.message);
        responseText = await fetchViaProxy(oembedUrl);
      }
    } else {
      responseText = await fetchViaProxy(oembedUrl);
    }
  } catch (err) {
    logger.error('Failed to fetch pin oEmbed data:', err);
    throw new Error(`Could not retrieve pin image. ${err.message}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseErr) {
    throw new Error('Invalid JSON from oEmbed endpoint.');
  }

  // According to Pinterest oEmbed docs, response contains:
  // - `image_url` (high‑quality image)
  // - `thumbnail_url`
  // - `title` (optional)
  const imageUrl = data.image_url || data.thumbnail_url;
  if (!imageUrl) {
    throw new Error('No image found in oEmbed response. The pin may be private or deleted.');
  }

  return {
    imageUrl,
    title: data.title || '',   // optional
  };
};

// ----- Random image selector (unchanged) -----
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};