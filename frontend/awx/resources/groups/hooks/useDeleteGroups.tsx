import { useTranslation } from 'react-i18next';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useNameColumn } from '../../../../common/columns';
import { useMemo } from 'react';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { compareStrings } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGroupsColumns } from './useGroupsColumns';

export function useDeleteGroups(onComplete: (groups: InventoryGroup[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useGroupsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<InventoryGroup>();
  const deleteGroups = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Permanently delete groups', { count: groups.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} groups.', {
        count: groups.length,
      }),
      actionButtonText: t('Delete groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (group: InventoryGroup, signal) =>
        requestDelete(awxAPI`/groups/${group.id.toString()}/`, signal),
    });
  };
  return deleteGroups;
}
