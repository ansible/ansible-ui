import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { useMemo } from 'react';
import { RemoteRegistry } from '../RemoteRegistry';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { HubRoute } from '../../HubRoutes';
import { ButtonVariant } from '@patternfly/react-core';

export function useRemoteRegistriesToolbarActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  // delete remote registries
  const actions = useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        icon: PlusIcon,
        isPinned: true,
        label: t('Create remote registry'),
        onClick: () => pageNavigate(HubRoute.CreateRemoteRegistry),
        selection: PageActionSelection.None,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected remote registries'),
        onClick: () => {},
        isDanger: true,
      },
    ],
    [t, pageNavigate]
  );

  return actions;
}
