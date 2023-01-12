import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useDeleteUsers } from './useDeleteUser';

export function useUsersActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUsers = useDeleteUsers(() => void refresh());
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create User'),
        onClick: () => navigate(RouteE.CreateEdaUser),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected Users'),
        onClick: (Users: EdaUser[]) => deleteUsers(Users),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );
}
