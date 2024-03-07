import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { IHubView } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';

export function useRemoteToolbarActions(view: IHubView<HubRemote>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRemotes = useDeleteRemotes(view.unselectItemsAndRefresh);

  const actions = useMemo<IPageAction<HubRemote>[]>(
    () => [
      {
        icon: PlusCircleIcon,
        isPinned: true,
        label: t('Create remote'),
        onClick: () => pageNavigate(HubRoute.CreateRemote),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected remotes'),
        onClick: deleteRemotes,
        isDanger: true,
      },
    ],
    [t, deleteRemotes, pageNavigate]
  );

  return actions;
}
