// vitest.setup.ts
import { enablePreview, polyfillJsdom } from '@ansible/ansible-ui-framework/vitest.common';
import '@testing-library/jest-dom/vitest';

enablePreview();
polyfillJsdom();
