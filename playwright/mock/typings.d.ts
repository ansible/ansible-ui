import { MockContext, Router } from '@ansible/aap-mock';
import { Page as PlaywrightPage } from '@playwright/test';

export type Mock =
  | { enabled: false }
  | { enabled: true; data: MockContext['data']; options: MockContext['options']; router: Router };

declare module '@playwright/test' {
  interface Page extends PlaywrightPage {
    mock: Mock;
  }
}
