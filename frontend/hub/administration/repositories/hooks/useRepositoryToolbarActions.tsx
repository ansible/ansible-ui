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

export function useRepositoryToolbarActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
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
        label: t('Delete selected repositories'),
        onClick: () => {},
        selection: PageActionSelection.Multiple,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, pageNavigate]
  );
  return actions;
}

export function useRepositoryCollectionVersionToolbarActions() {
  const { t } = useTranslation();
  const actions = useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        isPinned: true,
        label: t('Add collection'),
        onClick: () => {},
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
    ],
    [t]
  );
  return actions;
}
