import { ReactElement, ReactNode, cloneElement } from 'react';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HubUser } from '../../../../frontend/hub/interfaces/expanded/HubUser';
import { HubError } from '../../../../frontend/hub/common/HubError';
import { useHubResource } from '../../../hooks/useHubResource';

export function PlatformHubUserIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetItem<PlatformUser>(gatewayV1API`/users/`, params.id);
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
