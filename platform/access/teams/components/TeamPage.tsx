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
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { Team } from '../../../interfaces/Team';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>(gatewayAPI`/v1/teams`, params.id);
  const getPageUrl = useGetPageUrl();

  const itemActions: IPageAction<Team>[] = useMemo(() => {
    const itemActions: IPageAction<Team>[] = [
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
  }, [t]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team.name}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Users) },
          { label: team.name },
        ]}
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
          page: PlatformRoute.Users,
          persistentFilterKey: 'teams',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.TeamDetails },
          { label: t('Roles'), page: PlatformRoute.TeamRoles },
          { label: t('Users'), page: PlatformRoute.TeamUsers },
          { label: t('Resource Access'), page: PlatformRoute.TeamResourceAccess },
        ]}
        params={{ id: team.id }}
      />
    </PageLayout>
  );
}
