import { compareStrings, usePageNavigate } from '@ansible/ansible-ui-framework';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { nameKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../../common/api/formatPath';
import { hubAPIDelete, parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { HubRoute } from '../../../main/HubRoutes';
import { RemoteRegistry } from '../RemoteRegistry';
import { useRemoteRegistriesColumns } from './useRemoteRegistriesColumns';

export function useDeleteRemoteRegistries(onComplete: (remoteRegistry: RemoteRegistry[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRemoteRegistriesColumns();
  const bulkAction = useHubBulkConfirmation<RemoteRegistry>();
  const pageNavigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();

  const deleteRemoteRegistry = (remoteRegistry: RemoteRegistry[]) => {
    bulkAction({
      title: t('Permanently delete remote registries', { count: remoteRegistry.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} remote registries.', {
        count: remoteRegistry.length,
      }),
      actionButtonText: t('Delete remote registries', { count: remoteRegistry.length }),
      items: remoteRegistry.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: nameKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      onComplete,
      alertPrompts: [
        t('This will also delete all associated resources under this remote registry.'),
      ],
      actionFn: (remoteRegistry: RemoteRegistry, signal: AbortSignal) =>
        hubAPIDelete(
          hubAPI`/_ui/v1/execution-environments/registries/${parsePulpIDFromURL(
            remoteRegistry.pulp_href
          )}/`,
          signal
        ).then(() => {
          clearCacheByKey(hubAPI`/_ui/v1/execution-environments/registries/`);
          return pageNavigate(HubRoute.RemoteRegistries);
        }),
    });
  };
  return deleteRemoteRegistry;
}
