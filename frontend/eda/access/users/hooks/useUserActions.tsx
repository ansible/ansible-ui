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
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaUser } from '../../../interfaces/EdaUser';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteUsers } from './useDeleteUser';

export function useUserActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  const { activeEdaUser } = useEdaActiveUser();

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
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user: EdaUser) => deleteUsers([user]),
        isDisabled: (user) =>
          !activeEdaUser || Number(user.id) === Number(activeEdaUser.id)
            ? t('Current user cannot be deleted')
            : undefined,
        isDanger: true,
      },
    ],
    [activeEdaUser, deleteUsers, pageNavigate, t]
  );
}
