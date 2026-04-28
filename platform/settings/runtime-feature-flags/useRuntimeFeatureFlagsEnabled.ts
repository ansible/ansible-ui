import { requestGet } from '@ansible/common-ui/crud/Data';
import useSWR from 'swr';
import { gatewayAPI } from '../../utils/gateway-api-utils';

interface FeatureFlagsSettings {
  RUNTIME_FEATURE_FLAGS: boolean;
}

export function useRuntimeFeatureFlagsEnabled() {
  const response = useSWR<FeatureFlagsSettings>(gatewayAPI`/settings/feature_flags/`, requestGet);

  return {
    isEnabled: response.data?.RUNTIME_FEATURE_FLAGS ?? false,
    isLoading: !response.data && !response.error,
  };
}
