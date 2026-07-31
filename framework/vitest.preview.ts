import { beforeEach } from 'vitest';
import { cleanup, screen, Screen } from '@testing-library/react';
import { debug } from 'vitest-preview';
import '@patternfly/patternfly/dist/patternfly-addons.css';
import '@patternfly/patternfly/dist/patternfly-base.css';
import '@patternfly/patternfly/dist/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

import { resetTestSwrCache } from './test-utils/swrTestWrapper';

(globalThis as unknown as Record<string, number>).__SWR_DEDUPING_INTERVAL__ = 0;

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
      cleanup();
      resetTestSwrCache();
    });
  });
}
