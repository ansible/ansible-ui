import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { EdaError } from '@ansible/eda-ui/common/EdaError';
import { EdaItemsResponse } from '@ansible/eda-ui/common/EdaItemsResponse';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaTeam } from '@ansible/eda-ui/interfaces/EdaTeam';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function PlatformEdaTeamIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams/`, params.id);
  const edaResourceResponse = useGet<EdaItemsResponse<EdaTeam>>(
    edaAPI`/teams/?resource__ansible_id=${team?.summary_fields?.resource?.ansible_id ?? ''}`
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
