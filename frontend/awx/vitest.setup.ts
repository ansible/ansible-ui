// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import '@ansible/ansible-ui-framework/vitest.i18n';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';

enablePreview();
