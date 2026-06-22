import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FusionAuth',
      formats: ['es'],
      fileName: 'vue-fusionauth',
    },
    rollupOptions: {
      external: ['vue', 'nuxt'],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: assetInfo => {
          if (assetInfo.names?.includes('vue-fusionauth.css')) {
            return 'style.css';
          }
          return assetInfo.names?.[0] ?? '[name][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, './src'),
    },
  },
});
