import { beforeEach } from 'vitest';
import { cleanup, screen, Screen } from '@testing-library/react';
import { debug } from 'vitest-preview';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import '@patternfly/quickstarts/dist/quickstarts.min.css';

type ScreenWithPreview = Screen & { preview: () => void };
export function enablePreview() {
  (screen as ScreenWithPreview).preview = debug;

  beforeEach((ctx) => {
    ctx.onTestFinished(({ task }) => {
      if (task?.result?.state === 'fail') {
        debug();
      }
      cleanup();
    });
  });
}
