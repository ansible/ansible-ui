// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import '@ansible/ansible-ui-framework/vitest.i18n';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
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

enablePreview();
