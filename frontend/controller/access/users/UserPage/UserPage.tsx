/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../../framework';
import { useItem } from '../../../../common/useItem';
import { RouteE } from '../../../../Routes';
import { User } from '../../../interfaces/User';
import { useDeleteUsers } from '../hooks/useDeleteUsers';
import { UserDetails } from './UserDetails';
import { UserOrganizations } from './UserOrganizations';
import { UserRoles } from './UserRoles';
import { UserTeams } from './UserTeams';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const user = useItem<User>('/api/v2/users', params.id ?? '0');
  const history = useNavigate();

  const deleteUsers = useDeleteUsers((deleted: User[]) => {
    if (deleted.length > 0) {
      history(RouteE.Users);
    }
  });

  const itemActions: IPageAction<User>[] = useMemo(() => {
    const itemActions: IPageAction<User>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: () => history(RouteE.EditUser.replace(':id', user?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: () => {
          if (!user) return;
          deleteUsers([user]);
        },
      },
    ];
    return itemActions;
  }, [t, history, user, deleteUsers]);

  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: user?.username }]}
        headerActions={
          <PageActions<User> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      <PageTabs loading={!user}>
        <PageTab label={t('Details')}>
          <UserDetails user={user!} />
        </PageTab>
        <PageTab label={t('Organizations')}>
          <UserOrganizations user={user!} />
        </PageTab>
        <PageTab label={t('Teams')}>
          <UserTeams user={user!} />
        </PageTab>
        <PageTab label={t('Roles')}>
          <UserRoles user={user!} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
