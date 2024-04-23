import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { HubFeatureFlags } from '../interfaces/expanded/HubFeatureFlags';
import { HubSettings } from '../interfaces/expanded/HubSettings';
import { HubUser } from '../interfaces/expanded/HubUser';
import { hubAPI } from './api/formatPath';
import { useHubActiveUser } from './useHubActiveUser';

export type HubContext = {
  featureFlags: Partial<HubFeatureFlags>;
  settings: Partial<HubSettings>;
  user?: HubUser | null | undefined;
  hasPermission: (permission: string) => boolean;
};

export const HubContext = createContext<HubContext>({
  featureFlags: {},
  settings: {},
  hasPermission: () => false,
});

export function useHubContext() {
  return useContext(HubContext);
}

export function HubContextProvider(props: { children: ReactNode }) {
  const hubFeatureFlagResponse = useSWR<HubFeatureFlags>(
    hubAPI`/_ui/v1/feature-flags/`,
    requestGet
  );
  const hubSettingsResponse = useSWR<HubSettings>(hubAPI`/_ui/v1/settings/`, requestGet);
  const { activeHubUser } = useHubActiveUser();
  const context = useMemo<HubContext>(
    () => ({
      featureFlags: hubFeatureFlagResponse.data ?? {},
      settings: hubSettingsResponse.data ?? {},
      user: activeHubUser,
      hasPermission: (permission) => hasPermission(permission, activeHubUser),
    }),
    [hubFeatureFlagResponse, hubSettingsResponse, activeHubUser]
  );
  return <HubContext.Provider value={context}>{props.children}</HubContext.Provider>;
}

function hasPermission(permission: string, user?: HubUser | null | undefined) {
  if (!user?.model_permissions) {
    return false;
  }

  if (!user.model_permissions[permission]) {
    // eslint-disable-next-line no-console
    console.error(`Unknown permission ${permission}`);
    return !!user.is_superuser;
  }

  return !!user.model_permissions[permission].has_model_permission;
}
