import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { webImageSearchPlugin} from './config/mediaSearchPlugin.js';

export default defineConfig({
  base: './',
  plugins: [react(), webImageSearchPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

