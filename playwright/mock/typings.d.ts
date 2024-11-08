import { Page as PlaywrightPage } from '@playwright/test';
import { IApiData } from './mockData';
import { mockOptions } from './mockOptions';
import { Router } from './router/Router';

export type Mock =
  | { enabled: false }
  | { enabled: true; data: IApiData; options: typeof mockOptions; router: Router };

declare module '@playwright/test' {
  interface Page extends PlaywrightPage {
    mock: Mock;
  }
}
