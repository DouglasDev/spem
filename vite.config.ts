import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/spem/' : '/',
  cacheDir: '.vite-cache',
  plugins: [{ ...wyw({ include: ['src/**/*.tsx'] }), enforce: 'pre' }, react()],
});
