import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { LegacyAuth } from '../interfaces/LegacyAuth';

interface LegacyAuthState {
  legacyAuth?: LegacyAuth | null | undefined;
  refreshLegacyAuth?: () => void;
  isLoading?: boolean;
}

export const LegacyAuthContext = createContext<LegacyAuthState>({});

export function useLegacyAuth() {
  return useContext(LegacyAuthContext);
}

export function LegacyAuthProvider(props: { children: ReactNode }) {
  const response = useSWR<LegacyAuth>(gatewayAPI`/legacy_auth/`, requestGet, {
    refreshInterval: 0,
  });

  const [legacyAuth, setLegacyAuth] = useState<LegacyAuth | undefined | null>(undefined);

  useEffect(() => {
    setLegacyAuth((auth) => {
      if (response.error) {
        return null; // clear on error
      }
      if (response.data) {
        return response.data;
      }
      if (response.isLoading) {
        return auth;
      }
      return null;
    });
  }, [response]);

  const mutate = response.mutate;
  const state = useMemo<LegacyAuthState>(() => {
    return {
      legacyAuth,
      refreshLegacyAuth: () => void mutate(undefined),
      isLoading: response.isLoading,
    };
  }, [legacyAuth, mutate, response.isLoading]);

  return <LegacyAuthContext.Provider value={state}>{props.children}</LegacyAuthContext.Provider>;
}
