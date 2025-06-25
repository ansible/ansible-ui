import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamPageActions } from '../hooks/useTeamActions';

export function PlatformTeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<PlatformTeam>(gatewayAPI`/teams/`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const actions = useTeamPageActions(() => pageNavigate(PlatformRoute.Teams));

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team.name}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: team.name },
        ]}
        headerActions={
          <PageActions<PlatformTeam> actions={actions} position={'right'} selectedItem={team} />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Teams'),
          page: PlatformRoute.Teams,
          persistentFilterKey: 'teams',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.TeamDetails },
          { label: t('Roles'), page: PlatformRoute.TeamRoles },
          { label: t('Users'), page: PlatformRoute.TeamUsers },
          { label: t('Administrators'), page: PlatformRoute.TeamAdmins },
        ]}
        params={{ id: team.id }}
      />
    </PageLayout>
  );
}
