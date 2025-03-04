import { Page } from 'playwright-core';

export function interceptRequest<T>(page: Page, url: string) {
  return new Promise((resolve, reject) => {
    page
      .route(url, async (route) => {
        const response = await route.fetch();
        const json = (await response.json()) as T;
        resolve(json);
        await route.fulfill({ response, json });
      })
      .catch(reject);
  });
}
