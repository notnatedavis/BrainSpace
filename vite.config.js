//   vite.config.js
//   build configuration

// ----- Imports -----
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ----- Main -----
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000,
    open: true,
    // ----- Pinterest RSS Feed Proxy -----
    // robust proxy that avoids crashing on invalid HTTP trailers
    // and gracefully handles upstream connection errors.
    proxy: {
      '/pinterest-rss': {
        target: 'https://www.pinterest.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinterest-rss/, ''),

        // prevent dev server from crashing when upstream sends
        // invalid trailers or encounters a network reset
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('[vite proxy] Upstream error:', err.message);
            // if the response hasn't been sent yet, return a 502
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Pinterest feed temporarily unreachable' }));
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            // remove the 'trailer' header to prevent Node.js from throwing ERR_HTTP_TRAILER_INVALID
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