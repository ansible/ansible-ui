import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { LoadingPage } from '../../framework/components/LoadingPage';
import { useGet } from '../common/crud/useGet';
import { hubAPI } from './api';

type HubFeatureFlags = {
  // execution environments
  container_signing: boolean;
  execution_environments: boolean;

  // keycloak login screen
  external_authentication: boolean;

  // community mode
  ai_deny_index: boolean;
  display_repositories: boolean;
  legacy_roles: boolean;

  // collection signing
  can_create_signatures: boolean;
  can_upload_signatures: boolean;
  collection_auto_sign: boolean;
  collection_signing: boolean;
  display_signatures: boolean;
  require_upload_signatures: boolean;
  signatures_enabled: boolean;

  // errors
  _messages: string[];
};

type HubSettings = {
  GALAXY_AUTO_SIGN_COLLECTIONS: boolean;
  GALAXY_COLLECTION_SIGNING_SERVICE: string;
  GALAXY_CONTAINER_SIGNING_SERVICE: string;
  GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: boolean;
  GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD: boolean;
  GALAXY_MINIMUM_PASSWORD_LENGTH: number | null;
  GALAXY_REQUIRE_CONTENT_APPROVAL: boolean;
  GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL: boolean;
  GALAXY_SIGNATURE_UPLOAD_ENABLED: boolean;
  GALAXY_TOKEN_EXPIRATION: number | null;
};

type HubPermissions = {
  [key: string]: {
    global_description: string;
    has_model_permission: boolean;
    name: string;
    object_description: string;
    ui_category: string;
  };
};

type HubGroup = {
  id: number;
  name: string;
  object_roles?: string[];
};

type HubUser = {
  auth_provider: string[];
  date_joined: string;
  email: string;
  first_name: string;
  groups: HubGroup[];
  id: number;
  is_anonymous: boolean;
  is_superuser: boolean;
  last_name: string;
  model_permissions: HubPermissions;
  username: string;
};

export type HubContext = {
  featureFlags: HubFeatureFlags;
  hasPermission: (name: string) => boolean;
  settings: HubSettings;
  user: HubUser;
};

const HubContext = createContext<HubContext>(null);

export const useHubContext = (): HubContext => useContext(HubContext);

export const HubContextProvider = ({ children }: { children: ReactNode }) => {
  const getFeatureFlags = useGet(hubAPI`/_ui/v1/feature-flags/`);
  const getSettings = useGet(hubAPI`/_ui/v1/settings/`);
  const getUser = useGet(hubAPI`/_ui/v1/me/`);

  const [context, setContext] = useState<HubContext>(null);

  useEffect(() => {
    if (getFeatureFlags.isLoading || getSettings.isLoading || getUser.isLoading) {
      return;
    }

    setContext({
      errors: [
        getFeatureFlags.error,
        getSettings.error,
        getUser.error,
        ...(getFeatureFlags.data?._messages || []),
      ].filter(Boolean),
      feature_flags: getFeatureFlags.data,
      settings: getSettings.data,
      user: getUser.data,
    });
  }, [getFeatureFlags.isLoading, getSettings.isLoading, getUser.isLoading]);

  return context ? (
    <HubContext.Provider
      value={{
        ...context,
        hasPermission: hasPermission(context),
      }}
    >
      {children}
    </HubContext.Provider>
  ) : (
    <LoadingPage />
  );
};

const hasPermission =
  ({ user }: HubContext) =>
  (name) => {
    if (!user?.model_permissions) {
      return false;
    }

    if (!user.model_permissions[name]) {
      console.error(`Unknown permission ${name}`);
      return !!user.is_superuser;
    }

    return !!user.model_permissions[name].has_model_permission;
  };
