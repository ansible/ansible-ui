import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { EdaError } from '../../../../frontend/eda/common/EdaError';
import { EdaItemsResponse } from '../../../../frontend/eda/common/EdaItemsResponse';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
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
