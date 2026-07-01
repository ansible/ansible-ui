import { LoadingPage } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { HubError } from '@ansible/hub-ui/common/HubError';
import { HubTeam } from '@ansible/hub-ui/interfaces/expanded/HubTeam';
import { Page } from '@patternfly/react-core';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useHubResource } from '../../../hooks/useHubResource';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

/**
 * Component that gets the gateway/platform ID of a team from the URL params,
 * looks this team up in the gateway API to get its ansible_id and uses the ansible_id to
 * look the team up in HUB. It then renders the child component passing the HUB team ID to it as a prop.
 */
export function PlatformHubTeamIdLookup(props: Readonly<{ children: ReactNode }>) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams/`, params.id);
  const { resource: hubTeam, isLoading, error } = useHubResource<HubTeam>('_ui/v2/teams', team);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} />;
  }

  if (!hubTeam) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />
      </Page>
    );
  }
  return (
    <>
      {cloneElement(props.children as ReactElement<{ id?: string }>, {
        id: hubTeam?.id?.toString(),
      })}
    </>
  );
}
