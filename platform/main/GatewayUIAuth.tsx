import { ReactNode, createContext, useContext } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../frontend/common/crud/Data';
import { UIAuth } from '../interfaces/UIAuth';
import { gatewayAPI } from '../utils/gateway-api-utils';

export const ManagedCloudInstallContext = createContext<UIAuth | undefined>(undefined);

export function useGatewayUIAuth() {
  return useContext(ManagedCloudInstallContext);
}

export function GatewayUIAuthProvider(props: { children: ReactNode }) {
  const response = useSWR<UIAuth>(gatewayAPI`/ui_auth/`, requestGet);
  return (
    <ManagedCloudInstallContext.Provider value={response?.data}>
      {props.children}
    </ManagedCloudInstallContext.Provider>
  );
}

export function useIsManagedCloudInstall() {
  const uiAuth = useGatewayUIAuth();
  return uiAuth?.managed_cloud_install;
}
