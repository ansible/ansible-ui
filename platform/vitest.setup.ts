// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { Window } from 'happy-dom';
import { afterEach } from 'vitest';
import { mockI18n } from '@ansible/ansible-ui-framework/vitest.common';

mockI18n();

const window = global.window as unknown as Window;
window.HTMLCanvasElement.prototype.getContext = function (
  _contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
  _contextAttributes?: { [key: string]: unknown }
): null {
  return null;
};

afterEach(() => cleanup());
