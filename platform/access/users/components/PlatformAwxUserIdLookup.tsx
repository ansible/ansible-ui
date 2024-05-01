import { ReactElement, ReactNode, cloneElement } from 'react';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { Page } from '@patternfly/react-core';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';

/**
 * Component that gets the gateway/platform ID of a user from the URL params,
 * looks this user up in the gateway API to get its ansible_id and uses the ansible_id to
 * look the user up in AWX. It then renders the child component passing the AWX user ID to it as a prop.
 */
export function PlatformAwxUserIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetItem<PlatformUser>(gatewayV1API`/users/`, params.id);
  const awxResourceResponse = useGet<AwxItemsResponse<AwxUser>>(
    awxAPI`/users/?resource__ansible_id=${user?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  if (awxResourceResponse.isLoading) {
    return <LoadingPage />;
  }

  if (awxResourceResponse.error) {
    return <AwxError error={awxResourceResponse.error} />;
  }

  if (!awxResourceResponse.data || awxResourceResponse.data?.results.length !== 1) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />
      </Page>
    );
  }
  return (
    <>
      {cloneElement(props.children as ReactElement<{ id?: string }>, {
        id: awxResourceResponse.data?.results[0]?.id?.toString(),
      })}
    </>
  );
}
