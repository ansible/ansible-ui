import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaRole } from '../../../interfaces/EdaRole';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteRoles } from './useDeleteRole';

export function useRoleActions(view: IEdaView<EdaRole>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRoles = useDeleteRoles(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRole>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit Role'),
        onClick: (role: EdaRole) =>
          navigate(RouteObj.EditEdaRole.replace(':id', role.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete Role'),
        onClick: (role: EdaRole) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, navigate, t]
  );
}
