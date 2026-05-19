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
    // Pinterest RSS feed proxy config
    proxy: {
      '/pinterest-rss': {
        target: 'https://www.pinterest.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pinterest-rss/, ''),
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});