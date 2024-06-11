// <reference types="vitest" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'index',
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'next-client-cookies',
      ],
    },
    sourcemap: true,
  },
  plugins: [react(), dts({ rollupTypes: true, insertTypesEntry: true })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testing-tools/setup.ts',
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, './src'),
      '#components': resolve(__dirname, './src/components'),
      '#styles': resolve(__dirname, './src/styles'),
      '#testing-tools': resolve(__dirname, './src/testing-tools'),
    },
  },
});
