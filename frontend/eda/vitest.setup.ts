// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';
import '@ansible/ansible-ui-framework/vitest.i18n';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import { resetTestSwrCache } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';

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

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});
