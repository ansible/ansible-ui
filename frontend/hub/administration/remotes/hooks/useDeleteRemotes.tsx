import { compareStrings, usePageNavigate } from '@ansible/ansible-ui-framework';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { nameKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../../common/api/formatPath';
import { hubAPIDelete, parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';
import { useRemoteColumns } from './useRemoteColumns';

export function useDeleteRemotes(onComplete: (remotes: HubRemote[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRemoteColumns();
  const bulkAction = useHubBulkConfirmation<HubRemote>();
  const pageNavigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();

  const deleteRemotes = (remotes: HubRemote[]) => {
    bulkAction({
      title: t('Permanently delete remotes', { count: remotes.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} remotes.', {
        count: remotes.length,
      }),
      actionButtonText: t('Delete remotes', { count: remotes.length }),
      items: remotes.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: nameKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      onComplete,
      alertPrompts: [t('This will also delete all associated resources under this remote.')],
      actionFn: (remote: HubRemote, signal: AbortSignal) =>
        hubAPIDelete(
          pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(remote.pulp_href)}/`,
          signal
        ).then(() => {
          clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
          return pageNavigate(HubRoute.Remotes);
        }),
    });
  };
  return deleteRemotes;
}
