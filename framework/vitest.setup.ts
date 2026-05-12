// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { mockI18n, enablePreview, polyfillJsdom } from './vitest.common';

mockI18n();
enablePreview();
polyfillJsdom();
