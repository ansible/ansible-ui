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
import { EdaGroup } from '../../../interfaces/EdaGroup';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteGroups } from './useDeleteGroup';

export function useGroupActions(view: IEdaView<EdaGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteGroups = useDeleteGroups(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit group'),
        onClick: (Group: EdaGroup) =>
          pageNavigate(EdaRoute.EditGroup, { params: { id: Group.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete group'),
        onClick: (Group: EdaGroup) => deleteGroups([Group]),
        isDanger: true,
      },
    ],
    [deleteGroups, pageNavigate, t]
  );
}
