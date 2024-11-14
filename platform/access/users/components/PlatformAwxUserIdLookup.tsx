import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

/**
 * Component that gets the gateway/platform ID of a user from the URL params,
 * looks this user up in the gateway API to get its ansible_id and uses the ansible_id to
 * look the user up in AWX. It then renders the child component passing the AWX user ID to it as a prop.
 */
export function PlatformAwxUserIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/users/`, params.id);
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
