import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteUsers } from './useDeleteUsers';

export function useUserToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/users/`);
  const canCreateUser = Boolean(data && data.actions && data.actions['POST']);
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformUser>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create user'),
        isDisabled: canCreateUser
          ? undefined
          : t(
              'You do not have permission to create a user. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateUser),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: deleteUsers,
        isDanger: true,
      },
    ],
    [t, canCreateUser, getPageUrl, deleteUsers]
  );

  return toolbarActions;
}

export function useUserRowActions(onUsersDeleted: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(onUsersDeleted);

  const rowActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    // TODO: Update based on RBAC information from Users API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteUser = (user: PlatformUser) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The user cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Users API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditUser = (user: PlatformUser) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The user cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isDisabled: (user: PlatformUser) => cannotEditUser(user),
        onClick: (user) => pageNavigate(PlatformRoute.EditUser, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        isDisabled: (user: PlatformUser) => cannotDeleteUser(user),
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
  }, [deleteUsers, pageNavigate, t]);

  return rowActions;
}
