// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import { resetTestSwrCache } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});
