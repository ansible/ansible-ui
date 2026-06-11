import { Page } from 'playwright-core';
import { FeatureFlags } from '@ansible/awx-ui/common/useFeatureFlags';

export async function hasFeatureFlag(page: Page, flag: keyof FeatureFlags) {
  const response = await page.waitForResponse((response) =>
    response.url().includes('/feature_flags_state/')
  );
  try {
    const flags = (await response.json()) as FeatureFlags;
    return Boolean(flags && flags[flag]);
  } catch (_) {
    // API returned 404 or other error — no feature flags
    return false;
  }
}
