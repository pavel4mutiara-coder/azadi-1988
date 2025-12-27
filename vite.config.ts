
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Mobile apps often perform better with a single bundle or large chunks
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true
  }
});
