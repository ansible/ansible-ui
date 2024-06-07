import { ReactElement, ReactNode, cloneElement } from 'react';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { LoadingPage } from '../../../../framework';
import { EmptyStateCustom } from '../../../../framework/components/EmptyStateCustom';
import { Page } from '@patternfly/react-core';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';

/**
 * Component that gets the gateway/platform ID of a team from the URL params,
 * looks this team up in the gateway API to get its ansible_id and uses the ansible_id to
 * look the team up in AWX. It then renders the child component passing the AWX team ID to it as a prop.
 */
export function PlatformAwxTeamIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams/`, params.id);
  const awxResourceResponse = useGet<AwxItemsResponse<Team>>(
    awxAPI`/teams/?resource__ansible_id=${team?.summary_fields?.resource?.ansible_id ?? ''}`
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
