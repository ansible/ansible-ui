import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaUser } from '../../../interfaces/EdaUser';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteUsers } from './useDeleteUser';

export function useUsersActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  const { activeEdaUser } = useEdaActiveUser();
  const isCurrentUserSelected =
    activeEdaUser && view.selectedItems.length > 0 && view.isSelected(activeEdaUser);

  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create user'),
        isHidden: () => !activeEdaUser?.is_superuser,
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
    [deleteUsers, isCurrentUserSelected, activeEdaUser, pageNavigate, t]
  );
}
