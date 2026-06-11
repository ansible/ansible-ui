// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { mockI18n, enablePreview } from '@ansible/ansible-ui-framework/vitest.common';

mockI18n();
enablePreview();
