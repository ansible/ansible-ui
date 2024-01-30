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
import { CollectionVersionSearch } from '../../../collections/Collection';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';
import { useDeleteRepositories } from './useDeleteRepositories';
import { IHubView } from '../../../common/useHubView';

export function useRepositoryToolbarActions(view: IHubView<Repository>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRepositories = useDeleteRepositories(view.unselectItemsAndRefresh);
  const actions = useMemo<IPageAction<Repository>[]>(
    () => [
      {
        icon: PlusIcon,
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
        label: t('Delete repository'),
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

export function useRepositoryCollectionVersionToolbarActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const actions = useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        isPinned: true,
        label: t('Add collection'),
        onClick: () => pageNavigate(HubRoute.CreateRepository),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
    ],
    [t, pageNavigate]
  );
  return actions;
}
