// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { Window } from 'happy-dom';
import { mockI18n, enablePreview } from '@ansible/ansible-ui-framework/vitest.common';

mockI18n();
enablePreview();

const window = global.window as unknown as Window;
window.HTMLCanvasElement.prototype.getContext = function (
  _contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
  _contextAttributes?: { [key: string]: unknown }
): null {
  return null;
};
