// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import './vitest.i18n';
import './vitest.monaco';
import { enablePreview } from './vitest.preview';
import { resetTestSwrCache } from './test-utils/swrTestWrapper';

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});
