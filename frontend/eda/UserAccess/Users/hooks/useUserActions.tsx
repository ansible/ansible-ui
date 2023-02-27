import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaUser } from '../../../interfaces/EdaUser';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteUsers } from './useDeleteUser';

export function useUserActions(view: IEdaView<EdaUser>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit User'),
        onClick: (User: EdaUser) =>
          navigate(RouteObj.EditEdaUser.replace(':id', User.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete User'),
        onClick: (User: EdaUser) => deleteUsers([User]),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );
}
