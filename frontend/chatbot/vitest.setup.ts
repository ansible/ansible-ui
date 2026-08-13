// vitest.setup.ts
import { beforeEach } from 'vitest';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import '@testing-library/jest-dom/vitest';
import { resetTestSwrCache } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});
