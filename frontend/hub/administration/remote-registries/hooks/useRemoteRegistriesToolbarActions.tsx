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
import { RemoteRegistry } from '../RemoteRegistry';
import { useDeleteRemoteRegistries } from './useDeleteRemoteRegistries';

export function useRemoteRegistriesToolbarActions(view: IHubView<RemoteRegistry>) {
  const { t } = useTranslation();
  const deleteRemoteRegistries = useDeleteRemoteRegistries(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();

  const actions = useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        icon: PlusCircleIcon,
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
        onClick: deleteRemoteRegistries,
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteRemoteRegistries]
  );

  return actions;
}
