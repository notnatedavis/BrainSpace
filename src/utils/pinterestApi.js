//   src/utils/pinterestApi.js

//   Fetch public Pinterest board data via RSS feed, resolve a random pin's
//   source image via oEmbed, and validate that image before returning it.
//
//   In development (Vite) the dev‑server proxy /pinterest-rss is used for
//   BOTH the RSS feed and the oEmbed endpoint (Pinterest sends no CORS
//   headers for either, so a proxy is required in the browser).
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

// ----- Helper: extract pin entries from a parsed RSS document -----
/**
 * Walks every <item> in the RSS doc and pulls out the canonical pin URL
 * plus its human‑readable title. Pinterest exposes the pin URL both as
 * <link> and <guid>; we try <link> first and fall back to <guid>.
 *
 * @param {XMLDocument} doc
 * @returns {{ pinUrl: string, title: string }[]}
 */
const extractPinsFromRss = (doc) => {
  const items = doc.querySelectorAll('item');
  const pins = [];

  items.forEach((item, idx) => {
    const linkEl = item.querySelector('link');
    const guidEl = item.querySelector('guid');
    const titleEl = item.querySelector('title');

    let rawLink = linkEl ? linkEl.textContent.trim() : '';
    if (!rawLink && guidEl) rawLink = guidEl.textContent.trim();

    if (!rawLink) {
      logger.debug(`[Pinterest] RSS item ${idx} has no link/guid, skipping`);
      return;
    }

    if (!rawLink.includes('/pin/')) {
      logger.debug(`[Pinterest] RSS item ${idx} link is not a pin URL: ${rawLink}`);
      return;
    }

    pins.push({
      pinUrl: rawLink,
      title: titleEl ? titleEl.textContent.trim() : '',
    });
  });

  logger.debug(`[Pinterest] Extracted ${pins.length} pin link(s) from RSS`);
  return pins;
};

// ----- Environment‑aware URL builders -----
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

/**
 * Build the URL the browser will actually fetch for a pin's oEmbed data.
 *
 * - Dev:       routed through the Vite dev proxy (same prefix as RSS).
 *              No CORS, no wasted direct attempt.
 * - Prod:      the raw Pinterest URL; the caller passes this to
 *              `fetchViaProxy` so a public CORS proxy handles it.
 *
 * @param {string} pinUrl
 * @returns {string}
 */
const buildOembedUrl = (pinUrl) => {
  const encoded = encodeURIComponent(pinUrl);
  if (isDevEnvironment()) {
    return `/pinterest-rss/oembed.json?url=${encoded}`;
  }
  return `https://www.pinterest.com/oembed.json?url=${encoded}`;
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
 * If a custom proxy URL is set (CORS_PROXY_URL), it uses that directly.
 * Otherwise it iterates over PUBLIC_PROXIES until one succeeds.
 *
 * @param {string} targetUrl - The original URL you want to fetch
 * @returns {Promise<string>} response body text
 */
const fetchViaProxy = async (targetUrl) => {
  // 1) User‑supplied proxy
  if (CORS_PROXY_URL) {
    const proxyUrl = `${CORS_PROXY_URL}?${encodeURIComponent(targetUrl)}`;
    logger.debug(`[Pinterest] Using custom proxy: ${proxyUrl}`);
    return await fetchWithTimeout(proxyUrl);
  }

  // 2) No custom proxy – try public ones
  logger.debug('[Pinterest] No custom proxy configured, trying public proxies…');
  let lastError = null;

  for (const proxy of PUBLIC_PROXIES) {
    const proxyUrl = proxy.buildUrl(targetUrl);
    logger.debug(`[Pinterest] Trying proxy "${proxy.name}": ${proxyUrl}`);

    try {
      const text = await fetchWithTimeout(proxyUrl);
      logger.debug(`[Pinterest] Proxy "${proxy.name}" succeeded, response length: ${text.length}`);
      return text;
    } catch (err) {
      logger.warn(`[Pinterest] Proxy "${proxy.name}" failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(
    `All public CORS proxies failed. Last error: ${lastError?.message}. ` +
    'Set VITE_PINTEREST_PROXY in your .env file to use your own proxy.'
  );
};

// ----- Image validation -----
/**
 * Validate that an image URL is actually loadable by the browser.
 * Uses a temporary Image element – no CORS proxy needed for a simple
 * loadability test. Resolves `true` on successful load, `false` otherwise.
 *
 * @param {string} url - The image URL to validate
 * @param {number} timeoutMs - Maximum time to wait for load
 * @returns {Promise<boolean>}
 */
export const validateImageUrl = (url, timeoutMs = 8000) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      logger.warn('[Pinterest] validateImageUrl called with empty URL');
      resolve(false);
      return;
    }

    logger.debug(`[Pinterest] Validating image: ${url}`);
    const img = new Image();
    let settled = false;

    const finish = (ok, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (ok) {
        // Success: log the dimensions alongside the exact source URL.
        logger.debug(
          `[Pinterest] ✔ Image loaded — ${img.naturalWidth}x${img.naturalHeight} — src="${url}"`
        );
      } else {
        logger.warn(`[Pinterest] ✘ Image INVALID (${reason}) — src="${url}"`);
      }
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false, 'timeout'), timeoutMs);

    img.onload = () => finish(true, 'loaded');
    img.onerror = () => finish(false, 'error');

    // Some CDNs reject hotlinking – drop the referrer to be safe.
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
};

// ----- Small async utilities -----
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ----- Board data fetcher -----
/**
 * Fetches the RSS feed for a Pinterest board and returns its title plus
 * the list of pins (by pin URL). Cached for CACHE_TTL to be gentle.
 *
 * @param {string} boardUrl
 * @returns {Promise<{ title: string, pins: { pinUrl: string, title: string }[] }>}
 */
export const fetchBoardData = async (boardUrl) => {
  logger.debug(`[Pinterest] fetchBoardData called with URL: ${boardUrl}`);

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
    logger.debug(
      `[Pinterest] ✔ Board cache hit — title="${cached.title}" pins=${cached.pins.length} key="${cacheKey}"`
    );
    return cached;
  }

  // 2) Respect backoff
  if (!shouldRetry(cacheKey)) {
    logger.debug(`[Pinterest] Backoff active for "${cacheKey}", no cache – throwing`);
    throw new Error('Too many requests – cooling down');
  }

  const rssUrl = buildRssUrl(username, boardName);
  logger.debug(`[Pinterest] Raw RSS URL: ${rssUrl}`);

  let xmlText;
  try {
    if (isDevEnvironment()) {
      xmlText = await fetchWithTimeout(rssUrl);
    } else {
      xmlText = await fetchViaProxy(rssUrl);
    }
    logger.debug(`[Pinterest] RSS feed length: ${xmlText.length} characters`);
  } catch (err) {
    logger.error('[Pinterest] Failed to fetch RSS feed:', err);
    recordFailure(cacheKey);
    throw new Error(`Unable to load board RSS feed: ${err.message}`);
  }

  let doc;
  try {
    doc = parseXML(xmlText);
  } catch (err) {
    logger.error('[Pinterest] XML parsing failed:', err);
    recordFailure(cacheKey);
    throw new Error(`RSS feed could not be parsed: ${err.message}`);
  }

  const channelTitle = doc.querySelector('channel > title');
  const boardTitle = channelTitle ? channelTitle.textContent.trim() : boardName;
  logger.debug(`[Pinterest] Board title: "${boardTitle}"`);

  const pins = extractPinsFromRss(doc);
  if (pins.length === 0) {
    recordFailure(cacheKey);
    throw new Error('The board appears to be empty or not public.');
  }

  const result = { title: boardTitle, pins };
  setCache(cacheKey, result);
  resetBackoff(cacheKey);

  // Success: log the resolved board identity and how many pins are available.
  logger.debug(
    `[Pinterest] ✔ Board resolved — title="${boardTitle}" pins=${pins.length} source="${rssUrl}"`
  );
  return result;
};

// ----- Random validated pin fetcher -----
/**
 * Fetch a random pin from a board and validate its source image.
 *
 * Flow:
 *   1. Fetch the board RSS to get all pin URLs (cached).
 *   2. Shuffle the pins so selection is random.
 *   3. Individually attempt each pin:
 *      a. Fetch its oEmbed data to resolve the actual source image URL.
 *      b. Validate that image by attempting to load it in the browser.
 *      c. If valid → return { boardTitle, pinUrl, imageUrl, title }.
 *      d. If invalid → wait `delayBetweenMs` and try the next pin.
 *   4. Cap total attempts via `maxAttempts` to stay gentle on Pinterest.
 *   5. If every attempted pin fails, throw an error.
 *
 * @param {string} boardUrl
 * @param {object} [options]
 * @param {number} [options.maxAttempts=12]        Max pins to try
 * @param {number} [options.delayBetweenMs=400]    Pause between pin fetches
 * @param {number} [options.validationTimeoutMs=8000]
 * @returns {Promise<{ boardTitle: string, pinUrl: string, imageUrl: string, title: string }>}
 */
export const fetchRandomValidPin = async (boardUrl, options = {}) => {
  const {
    maxAttempts = 12,
    delayBetweenMs = 400,
    validationTimeoutMs = 8000,
  } = options;

  logger.debug(`[Pinterest] fetchRandomValidPin start: ${boardUrl}`);

  // 1. Get pin list from board (with cache)
  const { title: boardTitle, pins } = await fetchBoardData(boardUrl);
  if (!pins || pins.length === 0) {
    throw new Error('The board has no pins to choose from.');
  }

  // 2. Shuffle for random order
  const shuffled = shuffleArray(pins);
  const attempts = Math.min(maxAttempts, shuffled.length);

  logger.debug(
    `[Pinterest] Will attempt up to ${attempts} of ${shuffled.length} pin(s)`
  );

  let lastError = null;

  for (let i = 0; i < attempts; i++) {
    const pin = shuffled[i];
    logger.debug(`[Pinterest] Attempt ${i + 1}/${attempts} – pin: ${pin.pinUrl}`);

    try {
      // 3a. Resolve oEmbed → source image URL
      const { imageUrl, title: pinTitle } = await fetchPinImageData(pin.pinUrl);

      // 3b. Validate the source image by loading it
      const ok = await validateImageUrl(imageUrl, validationTimeoutMs);

      if (ok) {
        // Success: one consolidated, self-contained summary line so the
        // user can see exactly which board, pin, and source image resolved.
        logger.debug(
          `[Pinterest] ✔ RESOLVED — board="${boardTitle}" pin="${pin.pinUrl}" source="${imageUrl}"`
        );
        return {
          boardTitle,
          pinUrl: pin.pinUrl,
          imageUrl,
          title: pinTitle || pin.title || '',
        };
      }

      logger.warn(
        `[Pinterest] ✘ Pin image failed validation, trying next pin… (pin="${pin.pinUrl}")`
      );
      lastError = new Error(`Pin ${pin.pinUrl} image did not validate`);
    } catch (err) {
      logger.warn(`[Pinterest] ✘ Pin fetch failed: ${err.message}`);
      lastError = err;
    }

    // Small pause between attempts (rate‑limit friendliness)
    if (i < attempts - 1) {
      await delay(delayBetweenMs);
    }
  }

  throw new Error(
    `Could not find a valid pin after ${attempts} attempt(s). ` +
    (lastError ? `Last error: ${lastError.message}` : '')
  );
};

// ----- Fetch static pin image via oEmbed -----
/**
 * Fetches the static image URL (and optionally title) for a given Pinterest pin URL.
 * Uses Pinterest's oEmbed endpoint (`https://www.pinterest.com/oembed.json`).
 *
 * Environment handling:
 *   - Dev  → routed through the Vite dev proxy (`/pinterest-rss/oembed.json`).
 *   - Prod → passed through `fetchViaProxy` so a public CORS proxy handles it.
 *
 * In both cases exactly ONE network request is made — no direct‑then‑fallback
 * dance, which previously produced a spurious CORS warning on every success.
 *
 * @param {string} pinUrl - e.g. "https://www.pinterest.com/pin/578360777206614341/"
 * @returns {Promise<{ imageUrl: string, title: string }>}
 */
export const fetchPinImageData = async (pinUrl) => {
  const pinId = parsePinUrl(pinUrl);
  if (!pinId) {
    throw new Error(
      'Invalid Pinterest pin URL. Expected format: https://www.pinterest.com/pin/.../'
    );
  }

  const oembedUrl = buildOembedUrl(pinUrl);
  logger.debug(`[Pinterest] Fetching pin oEmbed data: ${oembedUrl}`);

  let responseText;
  try {
    if (isDevEnvironment()) {
      // Dev: hit the Vite proxy directly – no CORS, single request.
      responseText = await fetchWithTimeout(oembedUrl);
    } else {
      // Prod: the raw Pinterest URL must go through a public CORS proxy.
      responseText = await fetchViaProxy(oembedUrl);
    }
  } catch (err) {
    logger.error('[Pinterest] Failed to fetch pin oEmbed data:', err);
    throw new Error(`Could not retrieve pin image. ${err.message}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseErr) {
    throw new Error('Invalid JSON from oEmbed endpoint.');
  }

  // oEmbed response contains:
  // - `image_url`     (high‑quality source image)
  // - `thumbnail_url` (fallback)
  // - `title`         (optional)
  const imageUrl = data.image_url || data.thumbnail_url;
  if (!imageUrl) {
    throw new Error(
      'No image found in oEmbed response. The pin may be private or deleted.'
    );
  }

  // Success: log the resolved source image for this specific pin.
  logger.debug(
    `[Pinterest] ✔ Pin oEmbed resolved — pin="${pinUrl}" source="${imageUrl}"`
  );
  return {
    imageUrl,
    title: data.title || '', // optional
  };
};