import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

export function useCancelIventoryUpdate(onComplete: (inventorySources: InventorySource[]) => void) {
  const { t } = useTranslation();
  const bulkAction = useAwxBulkConfirmation<InventorySource>();
  const requestPost = usePostRequest();
  const confirmationColumns = useInventorySourceColumns({ disableLinks: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);

  const cancelInventoryUpdate = (inventorySources: InventorySource[]) => {
    bulkAction({
      title: t('Cancel Inventory Update'),
      confirmText: t('Yes, I confirm that I want to cancel inventory update.'),
      actionButtonText: t('Cancel Update'),
      items: inventorySources.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (inventorySource, signal) => {
        let job;
        if (inventorySource.summary_fields?.current_job) {
          job = inventorySource.summary_fields.current_job;
        } else if (inventorySource.summary_fields?.last_job) {
          job = inventorySource.summary_fields.last_job;
        }
        return requestPost(awxAPI`/inventory_updates/${String(job?.id)}/cancel/`, signal);
      },
    });
  };

  return cancelInventoryUpdate;
}
