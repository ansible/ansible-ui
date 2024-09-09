import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { HubError } from '../../../../frontend/hub/common/HubError';
import { HubUser } from '../../../../frontend/hub/interfaces/expanded/HubUser';
import { useHubResource } from '../../../hooks/useHubResource';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function PlatformHubUserIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/users/`, params.id);
  const { resource: hubUser, isLoading, error } = useHubResource<HubUser>('_ui/v2/users', user);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} />;
  }

  if (!hubUser) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />
      </Page>
    );
  }
  return (
    <>
      {cloneElement(props.children as ReactElement<{ id?: string }>, {
        id: hubUser?.id?.toString(),
      })}
    </>
  );
}
