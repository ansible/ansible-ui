import { Page } from 'playwright-core';
import { FeatureFlags } from '@ansible/awx-ui/common/useFeatureFlags';

export function mockFeatureFlags(page: Page, flags: FeatureFlags) {
  return page.route('*/**/feature_flags_state/', async (route) => {
    await route.fulfill({ json: flags });
  });
}
