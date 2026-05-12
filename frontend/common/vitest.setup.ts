// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { enablePreview, polyfillJsdom } from '@ansible/ansible-ui-framework/vitest.common';

enablePreview();
polyfillJsdom();
