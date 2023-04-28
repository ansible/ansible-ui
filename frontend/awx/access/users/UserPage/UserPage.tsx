/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  RoutedTabs,
  RoutedTab,
  PageBackTab,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../../Routes';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { User } from '../../../interfaces/User';
import { useDeleteUsers } from '../hooks/useDeleteUsers';
import { UserDetails } from './UserDetails';
import { UserOrganizations } from './UserOrganizations';
import { UserRoles } from './UserRoles';
import { UserTeams } from './UserTeams';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<User>('/api/v2/users', params.id);
  const history = useNavigate();

  const deleteUsers = useDeleteUsers((deleted: User[]) => {
    if (deleted.length > 0) {
      history(RouteObj.Users);
    }
  });

  const itemActions: IPageAction<User>[] = useMemo(() => {
    const itemActions: IPageAction<User>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: (user) => history(RouteObj.EditUser.replace(':id', user.id.toString() ?? '')),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [t, history, deleteUsers]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={user.username}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.Users }, { label: user.username }]}
        headerActions={
          <PageActions<User>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <RoutedTabs baseUrl={RouteObj.UserPage}>
        <PageBackTab label={t('Back to Users')} url={RouteObj.Users} persistentFilterKey="users" />
        <RoutedTab label={t('Details')} url={RouteObj.UserDetails}>
          <UserDetails user={user} />
        </RoutedTab>
        <RoutedTab label={t('Organizations')} url={RouteObj.UserOrganizations}>
          <UserOrganizations user={user} />
        </RoutedTab>
        <RoutedTab label={t('Teams')} url={RouteObj.UserTeams}>
          <UserTeams user={user} />
        </RoutedTab>
        <RoutedTab label={t('Roles')} url={RouteObj.UserRoles}>
          <UserRoles user={user} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
