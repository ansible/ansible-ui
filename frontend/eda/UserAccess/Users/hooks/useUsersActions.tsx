import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteUsers } from './useDeleteUser';

export function useUsersActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create User'),
        onClick: () => navigate(RouteObj.CreateEdaUser),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected Users'),
        onClick: (Users: EdaUser[]) => deleteUsers(Users),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );
}
