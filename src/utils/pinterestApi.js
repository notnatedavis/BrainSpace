// src/utils/pinterestApi.js
// Fetch public Pinterest board data via RSS feed.
// Uses a Vite proxy (/pinterest-rss) in development.
// In production, falls back to a list of CORS proxies with retry logic.
// Includes sanitization of invalid XML characters, caching, exponential backoff, and request deduplication.

import { logger } from './logger';

// ----- Determine which fetch endpoint to use -----
const isDevelopment = import.meta.env.DEV;

// List of CORS proxies to try (in order of preference)
const PROXY_LIST = [
  // Development proxy (only works in dev)
  isDevelopment ? '/pinterest-rss' : null,
  // Public CORS proxies
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?url=',
].filter(Boolean);

// ----- Simple in‑memory cache for the RSS data -----
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes (was 2)

// ----- Pending fetches deduplication -----
const pendingFetches = new Map();

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

// ----- Sanitize XML string: remove control characters except allowed ones -----
// Allowed XML 1.0 characters: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
const sanitizeXml = (text) => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
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
  const sanitized = sanitizeXml(text);
  const doc = parser.parseFromString(sanitized, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const errorMsg = errorNode.textContent || 'Unknown XML parsing error';
    throw new Error(`XML parse error: ${errorMsg.substring(0, 150)}`);
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

// ----- Build the actual fetch URL for a given proxy and board -----
const buildFetchUrl = (proxyBase, username, boardName) => {
  const rssPath = `/${username}/${boardName}.rss`;
  if (proxyBase === '/pinterest-rss') {
    // Development proxy
    return `${proxyBase}${rssPath}`;
  } else {
    // External proxy: encode the full Pinterest RSS URL
    const fullPinterestUrl = `https://www.pinterest.com${rssPath}`;
    return `${proxyBase}${encodeURIComponent(fullPinterestUrl)}`;
  }
};

// ----- Attempt a single fetch with a given proxy and timeout -----
const attemptFetch = async (proxyBase, username, boardName, timeoutMs = 30000) => {
  const fetchUrl = buildFetchUrl(proxyBase, username, boardName);
  logger.debug(`Attempting fetch with proxy: ${proxyBase} -> ${fetchUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      // Some proxies might need a specific user-agent; we add a generic one.
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrainSpace/1.0; +https://notnatedavis.github.io/BrainSpace)',
      },
    });
    clearTimeout(timeoutId);

    logger.debug(`RSS response status: ${response.status} from ${proxyBase}`);
    if (!response.ok) {
      // If status is 408 or 504 (gateway timeout), treat as a proxy failure
      if (response.status === 408 || response.status === 504) {
        throw new Error(`Proxy timeout (HTTP ${response.status})`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    logger.debug(`RSS feed length: ${xmlText.length} characters`);
    return xmlText;
  } catch (err) {
    clearTimeout(timeoutId);
    // If it's an AbortError, it's our own timeout
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after ' + timeoutMs + 'ms');
    }
    throw err;
  }
};

// ----- Main board data fetcher with proxy fallback and caching -----
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

  // 2) Deduplicate in-flight requests
  if (pendingFetches.has(cacheKey)) {
    logger.debug(`Fetch already in progress for "${cacheKey}", waiting for existing promise`);
    return pendingFetches.get(cacheKey);
  }

  // 3) Respect backoff – if recently failed, reuse expired cache or throw softly
  if (!shouldRetry(cacheKey)) {
    if (cached) {
      logger.debug(`Backoff active for "${cacheKey}", serving stale cache`);
      return cached;
    }
    logger.debug(`Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  // create the promise that tries each proxy
  const fetchPromise = (async () => {
    let lastError = null;
    // try each proxy in sequence
    for (let i = 0; i < PROXY_LIST.length; i++) {
      const proxyBase = PROXY_LIST[i];
      try {
        const xmlText = await attemptFetch(proxyBase, username, boardName, 30000); // 30s timeout
        // If we get HTML instead of XML, the proxy might have returned an error page
        if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.includes('<html')) {
          throw new Error('Proxy returned HTML instead of RSS – board may be private or invalid');
        }

        // Parse XML
        const doc = parseXML(xmlText);

        const channelTitle = doc.querySelector('channel > title');
        const boardTitle = channelTitle
          ? channelTitle.textContent.trim()
          : boardName;
        logger.debug(`Board title: "${boardTitle}"`);

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

        // Filter only pinimg.com URLs and deduplicate
        const pinImages = allImageUrls
          .filter(url => url.includes('pinimg.com'))
          .filter((url, idx, arr) => arr.indexOf(url) === idx);

        logger.debug(`Total unique Pinterest images found: ${pinImages.length}`);
        if (pinImages.length === 0) {
          throw new Error('No pin images found in the RSS feed. The board may be empty or private.');
        }

        const result = { title: boardTitle, pinImages };

        // Cache successful response and reset backoff
        setCache(cacheKey, result);
        resetBackoff(cacheKey);

        return result;
      } catch (err) {
        logger.warn(`Proxy ${proxyBase} failed:`, err.message);
        lastError = err;
        // If this was a timeout or 408, we can try the next proxy
        // Otherwise, maybe it's a permanent error (like 404) – we can stop retrying
        const isTimeout = err.message.includes('timed out') || err.message.includes('Proxy timeout');
        const isHtml = err.message.includes('HTML instead of RSS');
        const is404 = err.message.includes('HTTP 404');
        if (is404 || isHtml) {
          // These are likely final errors; no point in trying other proxies
          break;
        }
        // For other errors, continue to next proxy
        continue;
      }
    }

    // If we exhausted all proxies
    if (lastError) {
      recordFailure(cacheKey);
      // If we have stale cache, serve it
      const stale = getCached(cacheKey);
      if (stale) {
        logger.debug('Serving stale cache after all proxies failed');
        return stale;
      }
      throw lastError;
    }

    // should never happen, just in case
    throw new Error('No proxy available to fetch board data');
  })();

  // store the promise in pending map, remove when settled
  pendingFetches.set(cacheKey, fetchPromise);
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    pendingFetches.delete(cacheKey);
  }
};

// ----- Random image selector -----
export const getRandomPinImage = (pinImages) => {
  const randomIndex = Math.floor(Math.random() * pinImages.length);
  return pinImages[randomIndex];
};