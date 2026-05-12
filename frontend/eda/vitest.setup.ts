// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import {
  mockI18n,
  enablePreview,
  polyfillJsdom,
} from '@ansible/ansible-ui-framework/vitest.common';
import { vi } from 'vitest';

// Mock localStorage for MSW compatibility
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
globalThis.localStorage = localStorageMock as Storage;

mockI18n();
enablePreview();
polyfillJsdom();
