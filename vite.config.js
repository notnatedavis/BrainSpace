//   vite.config.js
//   build configuration

// ----- Imports -----
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ----- Main -----
export default defineConfig({
  // Set base path for GitHub Pages deployment (repo name: BrainSpace)
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
    // ----- Pinterest RSS Feed Proxy (development only) -----
    proxy: {
      '/pinterest-rss': {
        target: 'https://www.pinterest.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinterest-rss/, ''),
        configure: (proxy) => {
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