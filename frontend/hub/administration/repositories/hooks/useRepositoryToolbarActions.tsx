import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IHubView } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';
import { useDeleteRepositories } from './useDeleteRepositories';

export function useRepositoryToolbarActions(view: IHubView<Repository>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRepositories = useDeleteRepositories(view.unselectItemsAndRefresh);
  const actions = useMemo<IPageAction<Repository>[]>(
    () => [
      {
        icon: PlusCircleIcon,
        isPinned: true,
        label: t('Create repository'),
        onClick: () => pageNavigate(HubRoute.CreateRepository),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      { type: PageActionType.Seperator },
      {
        icon: TrashIcon,
        label: t('Delete repositories'),
        onClick: deleteRepositories,
        selection: PageActionSelection.Multiple,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteRepositories]
  );
  return actions;
}
