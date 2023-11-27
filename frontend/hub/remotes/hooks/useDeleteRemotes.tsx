import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { nameKeyFn } from '../../../common/utils/nameKeyFn';
import { hubAPIDelete, parsePulpIDFromURL } from '../../api/utils';
import { pulpAPI } from '../../api/formatPath';
import { IRemotes } from '../Remotes';
import { useRemoteColumns } from './useRemoteColumns';

export function useDeleteRemotes(onComplete: (remotes: IRemotes[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRemoteColumns();
  const bulkAction = useBulkConfirmation<IRemotes>();

  const deleteRemotes = (remotes: IRemotes[]) => {
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
      actionFn: async (remote: IRemotes, signal: AbortSignal) =>
        await hubAPIDelete(
          pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(remote.pulp_href) || ''}/`,
          signal
        ),
    });
  };
  return deleteRemotes;
}
