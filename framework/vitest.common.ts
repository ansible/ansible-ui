import { vi, beforeEach } from 'vitest';
import { cleanup, screen, Screen } from '@testing-library/react';
import { debug } from 'vitest-preview';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

import { resetTestSwrCache } from './test-utils/swrTestWrapper';

// Match Playwright setup: disable SWR deduping in unit tests.
(globalThis as unknown as Record<string, number>).__SWR_DEDUPING_INTERVAL__ = 0;

export { SwrTestWrapper, swrTestConfig, resetTestSwrCache } from './test-utils/swrTestWrapper';

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

  beforeEach(() => {
    resetTestSwrCache();
  });

  beforeEach((ctx) => {
    ctx.onTestFinished(({ task }) => {
      if (task?.result?.state === 'fail') {
        debug();
      }
      // Still perform cleanup, but after capturing the DOM state
      cleanup();
      resetTestSwrCache();
    });
  });
}
