import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'sdk-vanilla',
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
