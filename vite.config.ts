
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const buildNumber = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 86400000) + 1; // days since Jan 1 2026
const buildDate = new Date().toISOString().split('T')[0];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(`v${pkg.version}`),
    __BUILD_NUMBER__: buildNumber,
    __RELEASE_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  }
});
