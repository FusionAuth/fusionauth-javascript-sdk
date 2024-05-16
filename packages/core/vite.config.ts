/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@fusionauth-sdk/core',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['**/*.test.*'],
    },
  },
  plugins: [dts()],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, './src'),
    },
  },
});
