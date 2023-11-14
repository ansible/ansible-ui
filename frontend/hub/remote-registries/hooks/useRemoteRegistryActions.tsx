import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { RemoteRegistry } from '../RemoteRegistry';
import { useDeleteRemoteRegistries } from './useDeleteRemoteRegistries';

export function useRemoteRegistryActions(options: {
  onRemoteRegistryDeleted: (remoteRegistry: RemoteRegistry[]) => void;
}) {
  const { onRemoteRegistryDeleted } = options;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRemoteRegistries = useDeleteRemoteRegistries(onRemoteRegistryDeleted);
  const actions = useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        icon: EditIcon,
        isPinned: true,
        label: t('Edit remote registry'),
        onClick: (remoteRegistry) => {
          pageNavigate(HubRoute.EditRemoteRegistry, { params: { id: remoteRegistry.name } });
        },
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      { type: PageActionType.Seperator },
      {
        icon: TrashIcon,
        label: t('Delete remote registry'),
        onClick: (remoteRegistries) => deleteRemoteRegistries([remoteRegistries]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteRemoteRegistries]
  );
  return actions;
}
