import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
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

export function useGroupsActions(view: IEdaView<EdaGroup>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteGroups = useDeleteGroups(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create Group'),
        onClick: () => pageNavigate(EdaRoute.CreateGroup),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected groups'),
        onClick: (Groups: EdaGroup[]) => deleteGroups(Groups),
        isDanger: true,
      },
    ],
    [deleteGroups, pageNavigate, t]
  );
}
