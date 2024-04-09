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
import { useEdaActiveUser } from '../common/useEdaActiveUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const { activeEdaUser, activeEdaUserIsLoading, refreshActiveEdaUser } = useEdaActiveUser();

  if (activeEdaUserIsLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeEdaUser) {
    return (
      <Login apiUrl={edaAPI`/auth/session/login/`} onSuccess={() => refreshActiveEdaUser?.()} />
    );
  }

  return props.children;
}
