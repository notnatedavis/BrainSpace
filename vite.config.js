//   vite.config.js
//   build configuration

// ----- Imports -----
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ----- Main -----
export default defineConfig({
  // Base path for GitHub Pages (repository name is 'BrainSpace')
  base: '/BrainSpace/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000,
    open: true,
    // ----- Pinterest proxy (development only) -----
    // Reused for both RSS feeds and the oEmbed endpoint:
    //   /pinterest-rss/user/board.rss          → https://www.pinterest.com/user/board.rss
    //   /pinterest-rss/oembed.json?url=…       → https://www.pinterest.com/oembed.json?url=…
    proxy: {
      '/pinterest-rss': {
        target: 'https://www.pinterest.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinterest-rss/, ''),
        configure: (proxy) => {
          // Strip localhost‑specific headers so Pinterest accepts the request
          // as if it originated directly from the browser.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
          proxy.on('error', (err, req, res) => {
            console.error('[vite proxy] Upstream error:', err.message);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Pinterest feed temporarily unreachable' }));
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            delete proxyRes.headers['trailer'];
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});