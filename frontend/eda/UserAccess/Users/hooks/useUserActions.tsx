import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteUsers } from './useDeleteUser';

export function useUserActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isPinned: true,
        onClick: (user: EdaUser) => pageNavigate(EdaRoute.EditUser, { params: { id: user.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user: EdaUser) => deleteUsers([user]),
        isDanger: true,
      },
    ],
    [deleteUsers, pageNavigate, t]
  );
}
