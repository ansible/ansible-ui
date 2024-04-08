<<<<<<< HEAD
import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
=======
import { Page } from '@patternfly/react-core';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { requestGet } from '../../common/crud/Data';
import { HubFeatureFlags } from '../interfaces/expanded/HubFeatureFlags';
import { HubSettings } from '../interfaces/expanded/HubSettings';
import { HubUser } from '../interfaces/expanded/HubUser';
<<<<<<< HEAD
=======
import { HubError } from './HubError';
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { hubAPI } from './api/formatPath';
import { useHubActiveUser } from './useHubActiveUser';

export type HubContext = {
<<<<<<< HEAD
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
=======
  featureFlags: HubFeatureFlags;
  settings: HubSettings;
  user?: HubUser;
  hasPermission: (name: string) => boolean;
};

export const HubContext = createContext<HubContext>({} as HubContext);
>>>>>>> 8269c803c (Login Flow Update (#1946))

export function useHubContext() {
  return useContext(HubContext);
}

<<<<<<< HEAD
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
=======
export const HubContextProvider = ({ children }: { children: ReactNode }) => {
  const getFeatureFlags = useSWR<HubFeatureFlags>(hubAPI`/_ui/v1/feature-flags/`, requestGet);
  const getSettings = useSWR<HubSettings>(hubAPI`/_ui/v1/settings/`, requestGet);
  const hubUser = useHubActiveUser();

  const context = useMemo<HubContext>(
    () => ({
      featureFlags: getFeatureFlags.data as HubFeatureFlags,
      settings: getSettings.data as HubSettings,
      user: hubUser,
      hasPermission: (permission) => hasPermission(permission, hubUser!),
    }),
    [getFeatureFlags, getSettings, hubUser]
  );

  if (getFeatureFlags.isLoading || getSettings.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (getFeatureFlags.error) {
    return (
      <Page>
        <HubError
          error={getFeatureFlags.error as Error}
          handleRefresh={() => void getFeatureFlags.mutate()}
        />
      </Page>
    );
  }

  if (getSettings.error) {
    return (
      <Page>
        <HubError
          error={getFeatureFlags.error as Error}
          handleRefresh={() => void getFeatureFlags.mutate()}
        />
      </Page>
    );
  }

  return <HubContext.Provider value={context}>{children}</HubContext.Provider>;
};

function hasPermission(permission: string, user: HubUser) {
>>>>>>> 8269c803c (Login Flow Update (#1946))
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
