/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { RouteObj } from '../../../../Routes';
import { AwxError } from '../../../common/AwxError';
import { Team } from '../../../interfaces/Team';
import { useViewActivityStream } from '../../common/useViewActivityStream';
import { useTeamActions } from '../hooks/useTeamActions';
import { TeamAccess } from './TeamAccess';
import { TeamDetails } from './TeamDetails';
import { TeamRoles } from './TeamRoles';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>('/api/v2/teams', params.id);
  const navigate = useNavigate();
  const itemActions = useTeamActions({
    onTeamsDeleted: () => navigate(RouteObj.Teams),
    isDetailsPageAction: true,
  });
  const viewActivityStreamAction = useViewActivityStream('team');
  const pageActions = [...viewActivityStreamAction, ...itemActions];

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: team?.name }]}
        headerActions={
          <PageActions<Team>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      <RoutedTabs isLoading={!team} baseUrl={RouteObj.TeamPage}>
        <PageBackTab label={t('Back to Teams')} url={RouteObj.Teams} persistentFilterKey="teams" />
        <RoutedTab label={t('Details')} url={RouteObj.TeamDetails}>
          <TeamDetails team={team} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.TeamAccess}>
          <TeamAccess team={team} />
        </RoutedTab>
        <RoutedTab label={t('Roles')} url={RouteObj.TeamRoles}>
          <TeamRoles team={team} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
