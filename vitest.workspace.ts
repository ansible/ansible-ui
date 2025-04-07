import { defineWorkspace } from 'vitest/config';

/* eslint-disable-next-line no-restricted-exports */
export default defineWorkspace([
  './platform/vite.config.ts',
  './framework/vite.config.ts',
  './frontend/eda/vite.config.ts',
  './frontend/awx/vite.config.ts',
  './frontend/hub/vite.config.ts',
  './frontend/chatbot/vite.config.ts',
]);
