/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
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
  const pageNavigate = usePageNavigate();
  const itemActions = useTeamActions({
    onTeamsDeleted: () => pageNavigate(AwxRoute.Teams),
    isDetailsPageAction: true,
  });
  const viewActivityStreamAction = useViewActivityStream('team');
  const pageActions = [...viewActivityStreamAction, ...itemActions];
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: getPageUrl(AwxRoute.Teams) }, { label: team?.name }]}
        headerActions={
          <PageActions<Team>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      <RoutedTabs isLoading={!team} baseUrl={RouteObj.TeamPage}>
        <PageBackTab
          label={t('Back to Teams')}
          url={getPageUrl(AwxRoute.Teams)}
          persistentFilterKey="teams"
        />
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
