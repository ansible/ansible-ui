import { DropdownPosition } from '@patternfly/react-core/deprecated';
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
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTeamActions } from '../hooks/useTeamActions';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>(awxAPI`/teams`, params.id);
  const pageNavigate = usePageNavigate();
  const itemActions = useTeamActions({
    onTeamsDeleted: () => pageNavigate(AwxRoute.Teams),
    isDetailsPageAction: true,
  });
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
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Teams'),
          page: AwxRoute.Teams,
          persistentFilterKey: 'teams',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.TeamDetails },
          { label: t('Users'), page: AwxRoute.TeamMembers },
          { label: t('Roles'), page: AwxRoute.TeamRoles },
        ]}
        params={{ id: team.id }}
      />
    </PageLayout>
  );
}
