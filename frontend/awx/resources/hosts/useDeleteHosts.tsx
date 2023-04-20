import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../common/columns';
import { getItemKey, requestDelete } from '../../../common/crud/Data';
import { AwxHost } from '../../interfaces/AwxHost';
import { useHostsColumns } from './Hosts';

export function useDeleteHosts(onComplete: (hosts: AwxHost[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHostsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<AwxHost>();
  const deleteHosts = (hosts: AwxHost[]) => {
    bulkAction({
      title: t('Permanently delete hosts', { count: hosts.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} hosts.', {
        count: hosts.length,
      }),
      actionButtonText: t('Delete hosts', { count: hosts.length }),
      items: hosts.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (host: AwxHost) => requestDelete(`/api/v2/hosts/${host.id}/`),
    });
  };
  return deleteHosts;
}
