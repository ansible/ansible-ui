import { Page } from '@patternfly/react-core';
<<<<<<< HEAD
import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser } from '../common/useEdaActiveUser';
import ProductIcon from './eda-logo.svg';

export function EdaLogin(props: { children: React.ReactNode }) {
  const { activeEdaUser, refreshActiveEdaUser } = useEdaActiveUser();

  if (activeEdaUser === undefined) {
=======
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { requestGet } from '../../common/crud/Data';
import { edaAPI } from '../common/eda-utils';
import { EdaActiveUserContext } from '../common/useEdaActiveUser';
import { EdaUser } from '../interfaces/EdaUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

  if (response.isLoading) {
>>>>>>> 8269c803c (Login Flow Update (#1946))
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

<<<<<<< HEAD
  if (!activeEdaUser) {
    return (
      <Login
        apiUrl={edaAPI`/auth/session/login/`}
        onSuccess={() => {
          refreshActiveEdaUser?.();
          void mutate(() => true);
        }}
        icon={<ProductIcon style={{ maxWidth: 64, maxHeight: 64 }} />}
        brand={process.env.BRAND}
        product={process.env.PRODUCT}
      />
    );
  }

  return props.children;
=======
  if (!response.data || response.error) {
    return <Login apiUrl={edaAPI`/auth/session/login/`} onSuccess={onSuccessfulLogin} />;
  }

  return (
    <EdaActiveUserContext.Provider
      value={{ user: response.data, refresh: () => void response.mutate(undefined) }}
    >
      {props.children}
    </EdaActiveUserContext.Provider>
  );
>>>>>>> 8269c803c (Login Flow Update (#1946))
}
