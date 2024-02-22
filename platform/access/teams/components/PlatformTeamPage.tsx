import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformTeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<PlatformTeam>(gatewayV1API`/teams/`, params.id);
  const getPageUrl = useGetPageUrl();

  const itemActions: IPageAction<PlatformTeam>[] = useMemo(() => {
    const itemActions: IPageAction<PlatformTeam>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit team'),
        href: (team) => getPageUrl(PlatformRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (team) => alert('TODO'),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [getPageUrl, t]);

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
            actions={itemActions}
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
