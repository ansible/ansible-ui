import { Page } from '@patternfly/react-core';

import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser } from '../common/useEdaActiveUser';
import ProductIcon from './eda-logo.svg';

export function EdaLogin(props: { children: React.ReactNode }) {
  const { activeEdaUser, refreshActiveEdaUser } = useEdaActiveUser();

  if (activeEdaUser === undefined) {
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser, useEdaActiveUserContext } from '../common/useEdaActiveUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const edaActiveUserContext = useEdaActiveUserContext();
  const edaActiveUser = useEdaActiveUser();

  if (response.isLoading) {

  if (edaActiveUserContext?.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }


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

  if (!edaActiveUser) {
    return (
      <Login
        apiUrl={edaAPI`/auth/session/login/`}
        onSuccess={() => void edaActiveUserContext?.mutate()}
      />
    );
  }

  return props.children;
}
