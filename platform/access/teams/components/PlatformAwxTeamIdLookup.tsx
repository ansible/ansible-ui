import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { Team } from '@ansible/awx-ui/interfaces/Team';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

/**
 * Component that gets the gateway/platform ID of a team from the URL params,
 * looks this team up in the gateway API to get its ansible_id and uses the ansible_id to
 * look the team up in AWX. It then renders the child component passing the AWX team ID to it as a prop.
 */
export function PlatformAwxTeamIdLookup(props: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams/`, params.id);
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
