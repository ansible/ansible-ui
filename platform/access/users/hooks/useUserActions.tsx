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
import { useParams } from 'react-router-dom';

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
    const cannotDeleteUser = (user: PlatformUser) => {
      if (user.managed) {
        return t(`System managed users cannot be deleted`);
      }
      return '';
    };
    const cannotEditUser = (user: PlatformUser) => {
      if (user.managed) {
        return t(`System managed users cannot be edited`);
      }
      return '';
    };

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isDisabled: cannotEditUser,
        onClick: (user) => pageNavigate(PlatformRoute.EditUser, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        isDisabled: cannotDeleteUser,
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
  }, [deleteUsers, pageNavigate, t]);

  return rowActions;
}

export function useUserPageActions(onUsersDeleted: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(onUsersDeleted);
  const params = useParams<{ id: string }>();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/users/${params.id ?? ''}/`
  );

  const canEditUser = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  const pageActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    const cannotDeleteUser = () =>
      canEditUser ? '' : t(`The user cannot be deleted due to insufficient permissions.`);
    const cannotEditUser = () =>
      canEditUser ? '' : t(`The user cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isDisabled: cannotEditUser,
        onClick: (user) => pageNavigate(PlatformRoute.EditUser, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        isDisabled: cannotDeleteUser,
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
  }, [deleteUsers, pageNavigate, t]);

  return pageActions;
}
