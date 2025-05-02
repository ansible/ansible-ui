import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { EdaError } from '@ansible/eda-ui/common/EdaError';
import { EdaItemsResponse } from '@ansible/eda-ui/common/EdaItemsResponse';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaUser } from '@ansible/eda-ui/interfaces/EdaUser';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function PlatformEdaUserIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/users/`, params.id);
  const edaResourceResponse = useGet<EdaItemsResponse<EdaUser>>(
    edaAPI`/users/?resource__ansible_id=${user?.summary_fields?.resource?.ansible_id ?? ''}`
  );
  if (edaResourceResponse.isLoading) {
    return <LoadingPage />;
  }

  if (edaResourceResponse.error) {
    return <EdaError error={edaResourceResponse.error} />;
  }

  if (!edaResourceResponse.data || edaResourceResponse.data?.results.length !== 1) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />
      </Page>
    );
  }
  return (
    <>
      {cloneElement(props.children as ReactElement<{ id?: string }>, {
        id: edaResourceResponse.data?.results[0]?.id?.toString(),
      })}
    </>
  );
}
