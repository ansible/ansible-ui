// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import '@ansible/ansible-ui-framework/vitest.i18n';
import '@ansible/ansible-ui-framework/vitest.monaco';
import { Window } from 'happy-dom';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import { resetTestSwrCache } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';

enablePreview();

beforeEach(() => {
  resetTestSwrCache();
});

const window = global.window as unknown as Window;
window.HTMLCanvasElement.prototype.getContext = function (
  _contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
  _contextAttributes?: { [key: string]: unknown }
): null {
  return null;
};
