import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { EditIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { hubAPI } from '../../api/formatPath';
import { hubAPIPost } from '../../api/utils';
import { RemoteRegistry } from '../RemoteRegistry';
import { useDeleteRemoteRegistries } from './useDeleteRemoteRegistries';

const syncRemoteRegistry = async (remoteRegistry: RemoteRegistry) => {
  const syncURL = hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistry.id}/sync/`;
  return hubAPIPost(syncURL, {});
};

export function useRemoteRegistryActions(options: {
  onRemoteRegistryDeleted: (remoteRegistry: RemoteRegistry[]) => void;
}) {
  const { onRemoteRegistryDeleted } = options;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();
  const deleteRemoteRegistries = useDeleteRemoteRegistries(onRemoteRegistryDeleted);
  const actions = useMemo<IPageAction<RemoteRegistry>[]>(
    () => [
      {
        icon: SyncIcon,
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sync remote registry'),
        onClick: (remoteRegistry) => {
          const alert: AlertProps = {
            variant: 'info',
            title: t(`Syncing remote registry ${remoteRegistry.name}`),
            timeout: 2000,
          };
          void syncRemoteRegistry(remoteRegistry)
            .then(() => {
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.addAlert({
                variant: 'danger',
                title: t('Failed to sync remote registry'),
                children: error instanceof Error && error.message,
              });
            });
        },
      },
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
    [t, pageNavigate, deleteRemoteRegistries, alertToaster]
  );
  return actions;
}
