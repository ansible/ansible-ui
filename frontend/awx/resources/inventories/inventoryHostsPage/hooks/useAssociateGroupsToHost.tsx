import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, postRequest } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../../common/useAwxBulkActionDialog';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';

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
