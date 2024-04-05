import { Page } from '@patternfly/react-core';
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { requestGet } from '../../common/crud/Data';
import { hubAPI } from '../common/api/formatPath';
import { HubActiveUserContext } from '../common/useHubActiveUser';
import { HubContextProvider } from '../common/useHubContext';
import { HubUser } from '../interfaces/expanded/HubUser';

export function HubLogin(props: { children: React.ReactNode }) {
  const response = useSWR<HubUser>(hubAPI`/_ui/v1/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

  if (response.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!response.data || response.error) {
    return <Login apiUrl={hubAPI`/_ui/v1/auth/login/`} onSuccess={onSuccessfulLogin} />;
  }

  return (
    <HubActiveUserContext.Provider
      value={{ user: response.data, refresh: () => void response.mutate(undefined) }}
    >
      <HubContextProvider>{props.children}</HubContextProvider>
    </HubActiveUserContext.Provider>
  );
}
