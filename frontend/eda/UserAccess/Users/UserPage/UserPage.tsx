/* eslint-disable react/prop-types */
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet } from '../../../../common/crud/useGet';
import { useEdaActiveUser } from '../../../../common/useActiveUser';
import { EdaRoute } from '../../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useDeleteUsers } from '../hooks/useDeleteUser';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted && deleted.length > 0) {
      pageNavigate(EdaRoute.Users);
    }
  });

  const getPageUrl = useGetPageUrl();

  const activeUser = useEdaActiveUser();
  const isViewingSelf = Number(user?.id) === Number(activeUser?.id);
  const canEditUser =
    activeUser?.is_superuser || activeUser?.roles.some((role) => role.name === 'Admin');
  const canViewUsers =
    activeUser?.is_superuser ||
    activeUser?.roles.some((role) => role.name === 'Admin' || role.name === 'Auditor');

  const isActionTab =
    location.pathname === getPageUrl(EdaRoute.UserDetails, { params: { id: user?.id } });
  const itemActions = useMemo<IPageAction<EdaUser>[]>(
    () =>
      isActionTab
        ? [
            {
              type: PageActionType.Button,
              variant: ButtonVariant.primary,
              selection: PageActionSelection.Single,
              icon: PencilAltIcon,
              isPinned: true,
              label: t('Edit user'),
              isHidden: (_user: EdaUser) => !canEditUser,
              onClick: (user: EdaUser) =>
                pageNavigate(EdaRoute.EditUser, { params: { id: user.id } }),
            },
            {
              type: PageActionType.Button,
              variant: ButtonVariant.primary,
              selection: PageActionSelection.Single,
              icon: PencilAltIcon,
              isPinned: true,
              isHidden: (_user: EdaUser) => canEditUser || !isViewingSelf,
              label: t('Edit user'),
              onClick: () => pageNavigate(EdaRoute.EditCurrentUser),
            },
            {
              type: PageActionType.Seperator,
            },
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Single,
              icon: TrashIcon,
              label: t('Delete user'),
              isHidden: (_user: EdaUser) => isViewingSelf,
              onClick: (user: EdaUser) => deleteUsers([user]),
              isDanger: true,
            },
          ]
        : [],
    [canEditUser, deleteUsers, isActionTab, isViewingSelf, pageNavigate, t]
  );
  if (!activeUser) return <LoadingPage breadcrumbs tabs />;
  const tabs = isViewingSelf
    ? [
        { label: t('Details'), page: EdaRoute.UserDetails },
        { label: t('Controller Tokens'), page: EdaRoute.UserTokens },
      ]
    : [{ label: t('Details'), page: EdaRoute.UserDetails }];
  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={
          canViewUsers
            ? [{ label: t('Users'), to: getPageUrl(EdaRoute.Users) }, { label: user?.username }]
            : undefined
        }
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Users'),
          page: EdaRoute.Users,
          persistentFilterKey: 'users',
        }}
        tabs={tabs}
        params={{ id: user?.id }}
      />
    </PageLayout>
  );
}
