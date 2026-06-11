import { useGet } from '@ansible/common-ui/crud/useGet';
import { awxAPI } from './api/awx-utils';

export interface FeatureFlags {
  // this is a fake feature flag to be used for testing purposes only
  TEST_FEATURE_ENABLED: boolean;
  FEATURE_OIDC_WORKLOAD_IDENTITY_ENABLED: boolean;
}

export function useFeatureFlags() {
  return useGet<FeatureFlags>(awxAPI`/feature_flags_state/`);
}

export function useFeatureFlag(flag: keyof FeatureFlags) {
  const { data: flags } = useFeatureFlags();

  if (!flags) {
    return false;
  }

  return flags[flag] || false;
}
