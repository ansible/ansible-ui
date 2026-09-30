// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import '@ansible/ansible-ui-framework/vitest.i18n';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import { resetTestSwrCache } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';

const localStorageMock = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};
globalThis.localStorage = localStorageMock as Storage;

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});
