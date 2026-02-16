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
      // '@': path.resolve(__dirname, 'src')
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});