//   src/config.js

//   Application configuration constants
//   Values can be overridden via environment variables (VITE_ prefix).

/**
 * A custom CORS proxy URL to use for Pinterest RSS requests.
 * Set this via VITE_PINTEREST_PROXY environment variable (e.g. in .env).
 * If left empty, the fetcher will try a sequence of public proxies.
 *
 * Example:  VITE_PINTEREST_PROXY=https://my-proxy.example.com
 */
export const CORS_PROXY_URL = import.meta.env.VITE_PINTEREST_PROXY || '';