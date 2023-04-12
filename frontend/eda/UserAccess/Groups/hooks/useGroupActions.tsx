import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaGroup } from '../../../interfaces/EdaGroup';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteGroups } from './useDeleteGroup';

export function useGroupActions(view: IEdaView<EdaGroup>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteGroups = useDeleteGroups(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.Single,
        icon: EditIcon,
        label: t('Edit Group'),
        onClick: (Group: EdaGroup) =>
          navigate(RouteObj.EditEdaGroup.replace(':id', Group.id.toString())),
      },
      {
        type: PageActionType.Single,
        icon: TrashIcon,
        label: t('Delete Group'),
        onClick: (Group: EdaGroup) => deleteGroups([Group]),
        isDanger: true,
      },
    ],
    [deleteGroups, navigate, t]
  );
}
