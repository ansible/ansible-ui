import { vi, beforeEach } from 'vitest';
import { cleanup, screen, Screen } from '@testing-library/react';
import { debug } from 'vitest-preview';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

export function mockI18n() {
  vi.mock('react-i18next', () => {
    const stableT = vi.fn((key: string, options?: Record<string, unknown>) => {
      if (options && typeof options === 'object') {
        let result = key;
        Object.entries(options).forEach(([param, value]) => {
          result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        });
        return result;
      }
      return key;
    });

    const stableI18n = {
      changeLanguage: vi.fn(), //stableChangeLanguage,
      language: 'en',
    };

    return {
      useTranslation: vi.fn(() => ({
        t: stableT,
        i18n: stableI18n,
      })),
      Trans: ({ children }: { children: React.ReactNode }) => children,
      initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
      },
    };
  });
}

type ScreenWithPreview = Screen & { preview: () => void };
export function enablePreview() {
  (screen as ScreenWithPreview).preview = debug;

  beforeEach((ctx) => {
    ctx.onTestFinished(({ task }) => {
      if (task?.result?.state === 'fail') {
        debug();
      }
      // Still perform cleanup, but after capturing the DOM state
      cleanup();
    });
  });
}

export function polyfillJsdom() {
  // Polyfill for HTMLCanvasElement (required for jsdom)
  if (global.window?.HTMLCanvasElement) {
    global.window.HTMLCanvasElement.prototype.getContext = function (
      _contextType: '2d' | 'webgl' | 'webgl2' | 'webgpu' | 'bitmaprenderer',
      _contextAttributes?: Record<string, unknown>
    ): null {
      return null;
    };
  }

  // Polyfill for matchMedia (required for jsdom + monaco-editor)
  if (global.window && !global.window.matchMedia) {
    Object.defineProperty(global.window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // deprecated
        removeListener: () => {}, // deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  }
}
