import { ReactElement, ReactNode, cloneElement } from 'react';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EdaItemsResponse } from '../../../../frontend/eda/common/EdaItemsResponse';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { EdaError } from '../../../../frontend/eda/common/EdaError';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';

export function PlatformEdaTeamIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams/`, params.id);
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
