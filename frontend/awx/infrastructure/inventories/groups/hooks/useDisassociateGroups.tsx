import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { compareStrings } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../../common/useAwxBulkConfirmation';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useGroupsColumns } from './useGroupsColumns';

export function useDisassociateGroups(onComplete: (groups: InventoryGroup[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useGroupsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const params = useParams<{ group_id: string }>();
  const bulkAction = useAwxBulkConfirmation<InventoryGroup>();
  const deleteGroups = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Permanently disassociate groups', { count: groups.length }),
      confirmText: t('Yes, I confirm that I want to disassociate these {{count}} groups.', {
        count: groups.length,
      }),
      actionButtonText: t('Disassociate groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (group: InventoryGroup, signal) =>
        postRequest(
          awxAPI`/groups/${params.group_id as string}/children/`,
          { disassociate: parseInt(params.group_id ?? ''), id: group.id },
          signal
        ),
    });
  };
  return deleteGroups;
}
