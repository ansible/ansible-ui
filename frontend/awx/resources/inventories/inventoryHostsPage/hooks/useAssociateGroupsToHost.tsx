import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useAwxBulkActionDialog } from '../../../../common/useAwxBulkActionDialog';

export function useAssociateGroupsToHost(
  onComplete: (groups: InventoryGroup[]) => void,
  hostId: string
) {
  const { t } = useTranslation();
  const addActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [addActionNameColumn], [addActionNameColumn]);
  const bulkAction = useAwxBulkActionDialog<InventoryGroup>();
  const associateGroupsToHost = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Add host to groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      actionColumns,
      onComplete,
      actionFn: async (group: InventoryGroup, signal: AbortSignal) => {
        await postRequest(
          awxAPI`/hosts/${hostId ?? ''}/groups/`,
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
