import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaRole } from '../../../interfaces/EdaRole';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteRoles } from './useDeleteRole';

export function useRolesActions(view: IEdaView<EdaRole>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRoles = useDeleteRoles(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaRole>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create Role'),
        onClick: () => navigate(RouteObj.CreateEdaRole),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected Roles'),
        onClick: (Roles: EdaRole[]) => deleteRoles(Roles),
        isDanger: true,
      },
    ],
    [deleteRoles, navigate, t]
  );
}
