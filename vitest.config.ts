import { defineConfig } from 'vitest/config';

/* eslint-disable-next-line no-restricted-exports */
export default defineConfig({
  test: {
    projects: [
      './platform/vite.config.ts',
      './framework/vite.config.ts',
      './frontend/eda/vite.config.ts',
      './frontend/awx/vite.config.ts',
      './frontend/hub/vite.config.ts',
      './frontend/common/vite.config.ts',
      './frontend/chatbot/vite.config.ts',
    ],
  },
});
