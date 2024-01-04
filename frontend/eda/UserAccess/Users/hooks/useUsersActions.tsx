import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { EdaUser } from '../../../interfaces/EdaUser';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteUsers } from './useDeleteUser';

export function useUsersActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  const activeUser = useEdaActiveUser();
  const isCurrentUserSelected =
    activeUser && view.selectedItems.length > 0 && view.isSelected(activeUser);

  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create user'),
        isHidden: () =>
          !activeUser?.is_superuser && !activeUser?.roles.find((role) => role.name === 'Admin'),
        onClick: () => pageNavigate(EdaRoute.CreateUser),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: (users: EdaUser[]) => deleteUsers(users),
        isDisabled: isCurrentUserSelected ? t('Current user cannot be deleted') : undefined,
        isDanger: true,
      },
    ],
    [deleteUsers, isCurrentUserSelected, activeUser, pageNavigate, t]
  );
}
