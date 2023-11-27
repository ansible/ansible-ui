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
import { User } from '../../../interfaces/User';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<User>(gatewayAPI`/v1/users`, params.id);
  const getPageUrl = useGetPageUrl();

  const itemActions: IPageAction<User>[] = useMemo(() => {
    const itemActions: IPageAction<User>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit user'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (user) => alert('TODO'),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (user) => alert('TODO'),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [t]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={user.username}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: user.username },
        ]}
        headerActions={
          <PageActions<User>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Users'),
          page: PlatformRoute.Users,
          persistentFilterKey: 'users',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.UserDetails },
          { label: t('Teams'), page: PlatformRoute.UserTeams },
          { label: t('Roles'), page: PlatformRoute.UserRoles },
          { label: t('Resource Access'), page: PlatformRoute.UserResourceAccess },
        ]}
        params={{ id: user.id }}
      />
    </PageLayout>
  );
}
