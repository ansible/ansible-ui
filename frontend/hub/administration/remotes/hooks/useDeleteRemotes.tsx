import { useTranslation } from 'react-i18next';
import { compareStrings, usePageNavigate } from '../../../../../framework';
import { nameKeyFn } from '../../../../common/utils/nameKeyFn';
import { pulpAPI } from '../../../common/api/formatPath';
import { hubAPIDelete, parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { HubRemote } from '../Remotes';
import { useRemoteColumns } from './useRemoteColumns';
import { HubRoute } from '../../../main/HubRoutes';

export function useDeleteRemotes(onComplete: (remotes: HubRemote[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRemoteColumns();
  const bulkAction = useHubBulkConfirmation<HubRemote>();
  const pageNavigate = usePageNavigate();

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
        ).then(() => pageNavigate(HubRoute.Remotes)),
    });
  };
  return deleteRemotes;
}
