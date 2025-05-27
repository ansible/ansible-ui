// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Window } from 'happy-dom';

const window = global.window as unknown as Window;
window.HTMLCanvasElement.prototype.getContext = function (
  _contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
  _contextAttributes?: { [key: string]: unknown }
): null {
  return null;
};

afterEach(() => cleanup());
