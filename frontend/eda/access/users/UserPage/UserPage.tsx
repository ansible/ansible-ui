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
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { EdaUser } from '../../../interfaces/EdaUser';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteUsers } from '../hooks/useDeleteUser';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`);
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted && deleted.length > 0) {
      pageNavigate(EdaRoute.Users);
    }
  });

  const getPageUrl = useGetPageUrl();

  const { activeEdaUser } = useEdaActiveUser();
  const isViewingSelf = Number(user?.id) === Number(activeEdaUser?.id);
  const canViewOrEditUsers = activeEdaUser?.is_superuser;

  const isActionTab =
    location.pathname === getPageUrl(EdaRoute.UserDetails, { params: { id: user?.id } });

  const itemActions = useMemo<IPageAction<EdaUser>[]>(() => {
    const actions: IPageAction<EdaUser>[] = isActionTab
      ? [
          {
            type: PageActionType.Button,
            variant: ButtonVariant.primary,
            selection: PageActionSelection.Single,
            icon: PencilAltIcon,
            isPinned: true,
            label: t('Edit user'),
            // isHidden: (_user: EdaUser) => !canViewOrEditUsers,
            onClick: (user: EdaUser) =>
              pageNavigate(EdaRoute.EditUser, { params: { id: user.id } }),
          },
          {
            type: PageActionType.Button,
            variant: ButtonVariant.primary,
            selection: PageActionSelection.Single,
            icon: PencilAltIcon,
            isPinned: true,
            isHidden: (_user: EdaUser) => canViewOrEditUsers || !isViewingSelf,
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
            isDisabled: (_user: EdaUser) =>
              isViewingSelf ? t('Current user cannot be deleted') : undefined,
            onClick: (user: EdaUser) => deleteUsers([user]),
            isDanger: true,
          },
        ]
      : [];
    return actions;
  }, [canViewOrEditUsers, deleteUsers, isViewingSelf, pageNavigate, isActionTab, t]);

  if (!activeEdaUser) return <LoadingPage breadcrumbs tabs />;
  const tabs = isViewingSelf
    ? [
        { label: t('Details'), page: EdaRoute.UserDetails },
        { label: t('Roles'), page: EdaRoute.UserRoles },
        { label: t('Controller Tokens'), page: EdaRoute.UserTokens },
      ]
    : [
        { label: t('Details'), page: EdaRoute.UserDetails },
        { label: t('Roles'), page: EdaRoute.UserRoles },
      ];
  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={
          canViewOrEditUsers
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
