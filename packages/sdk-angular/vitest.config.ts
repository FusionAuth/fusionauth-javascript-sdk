import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./projects/fusionauth-angular-sdk/src/test-setup.ts'],
  },
});
