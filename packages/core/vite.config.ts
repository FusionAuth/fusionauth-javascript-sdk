/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@fusionauth-sdk/core',
      fileName: 'index',
    },
    rollupOptions: {
      input: resolve(__dirname, 'src/index.ts'),
    },
  },
  plugins: [dts()],
  server: {
    port: 3001,
  },
});
