import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useParams } from 'react-router-dom';
import { useAwxBulkActionDialog } from '../../../../common/useAwxBulkActionDialog';

export function useAssociateGroupsToHost(onComplete: (groups: InventoryGroup[]) => void) {
  const { t } = useTranslation();
  const addActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [addActionNameColumn], [addActionNameColumn]);
  const bulkAction = useAwxBulkActionDialog<InventoryGroup>();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const associateGroupsToHost = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Add host to groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      actionColumns,
      onComplete,
      actionFn: async (group: InventoryGroup, signal: AbortSignal) => {
        await postRequest(
          awxAPI`/hosts/${params.host_id ?? ''}/groups/`,
          {
            id: group.id,
          },
          signal
        );
      },
      processingText: t('Adding host to group...', { count: groups.length }),
    });
  };
  return associateGroupsToHost;
}
