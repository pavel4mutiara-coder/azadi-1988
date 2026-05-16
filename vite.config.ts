
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
