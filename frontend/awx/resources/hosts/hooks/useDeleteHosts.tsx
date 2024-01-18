import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useHostsColumns } from './useHostsColumns';

export function useDeleteHosts(onComplete: (hosts: AwxHost[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHostsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<AwxHost>();
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
      actionFn: (host: AwxHost, signal) =>
        requestDelete(awxAPI`/hosts/${host.id.toString()}/`, signal),
    });
  };
  return deleteHosts;
}
