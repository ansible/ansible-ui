import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { Organization as AwxOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function PlatformAwxOrganizationIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations/`,
    params.id
  );
  const awxResourceResponse = useGet<AwxItemsResponse<AwxOrganization>>(
    awxAPI`/organizations/?resource__ansible_id=${organization?.summary_fields?.resource?.ansible_id ?? ''}`
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
