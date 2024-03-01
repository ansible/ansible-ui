import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useTeamRowActions } from '../hooks/useTeamActions';

export function PlatformTeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<PlatformTeam>(gatewayV1API`/teams/`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const actions = useTeamRowActions(() => pageNavigate(PlatformRoute.Teams));

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
          <PageActions<PlatformTeam>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
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
          { label: t('Resource Access'), page: PlatformRoute.TeamResourceAccess },
        ]}
        params={{ id: team.id }}
      />
    </PageLayout>
  );
}
