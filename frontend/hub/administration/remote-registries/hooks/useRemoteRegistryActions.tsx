import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { hubAPI } from '../../../common/api/formatPath';
import { hubAPIPost } from '../../../common/api/hub-api-utils';
import { HubRoute } from '../../../main/HubRoutes';
import { RemoteRegistry } from '../RemoteRegistry';
import { useDeleteRemoteRegistries } from './useDeleteRemoteRegistries';

const syncRemoteRegistry = async (remoteRegistry: RemoteRegistry) => {
  const syncURL = hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistry.id}/sync/`;
  return hubAPIPost(syncURL, {});
};

const indexExecutionEnvironments = async (remoteRegistry: RemoteRegistry) => {
  const indexURL = hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistry.id}/index/`;
  return hubAPIPost(indexURL, {});
};

export function useRemoteRegistryActions(options: {
  onRemoteRegistryDeleted: (remoteRegistry: RemoteRegistry[]) => void;
  refresh?: () => Promise<void>;
}) {
  const { onRemoteRegistryDeleted, refresh } = options;
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();
  const deleteRemoteRegistries = useDeleteRemoteRegistries(onRemoteRegistryDeleted);
  const isIndexableItem = useCallback(
    (remoteRegistry: RemoteRegistry) => {
      if (remoteRegistry.is_indexable === true) return '';
      return t`Indexing execution environments is only supported on registry.redhat.io`;
    },
    [t]
  );
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
              void refresh?.();
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
        label: t('Index execution environments'),
        onClick: (remoteRegistry) => {
          const alert: AlertProps = {
            variant: 'info',
            title: t(`Indexing remote registry ${remoteRegistry.name}`),
            timeout: 2000,
          };
          void indexExecutionEnvironments(remoteRegistry)
            .then(() => {
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.addAlert({
                variant: 'danger',
                title: t('Failed to index remote registry'),
                children: error instanceof Error && error.message,
              });
            });
        },
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        isDisabled: (remoteRegistry) => isIndexableItem(remoteRegistry),
        tooltip: t('Find execution environments in this registry'),
      },
      {
        icon: PencilAltIcon,
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
    [t, pageNavigate, deleteRemoteRegistries, alertToaster, isIndexableItem, refresh]
  );
  return actions;
}
