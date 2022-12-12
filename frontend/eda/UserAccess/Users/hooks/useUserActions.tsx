import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useDeleteUsers } from './useDeleteUser';

export function useUserActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUsers = useDeleteUsers(() => void refresh());
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit User'),
        onClick: (User: EdaUser) => navigate(RouteE.EditEdaUser.replace(':id', User.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete User'),
        onClick: (User: EdaUser) => deleteUsers([User]),
      },
    ],
    [deleteUsers, navigate, t]
  );
}
