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
  },
  plugins: [
    dts({
      exclude: ['**/*.test.ts'],
    }),
  ],
});
