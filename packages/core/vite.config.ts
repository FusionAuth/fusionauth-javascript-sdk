import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
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
