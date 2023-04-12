/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
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
        type: PageActionType.Single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: (user) => history(RouteObj.EditUser.replace(':id', user.id.toString() ?? '')),
      },
      {
        type: PageActionType.Single,
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
      <PageTabs>
        <PageTab label={t('Details')}>
          <UserDetails user={user} />
        </PageTab>
        <PageTab label={t('Organizations')}>
          <UserOrganizations user={user} />
        </PageTab>
        <PageTab label={t('Teams')}>
          <UserTeams user={user} />
        </PageTab>
        <PageTab label={t('Roles')}>
          <UserRoles user={user} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
