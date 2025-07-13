// vite.config.ts

import path from 'path';
import { defineConfig } from 'vite';

// No need to load .env files here for exposing keys to the client
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});