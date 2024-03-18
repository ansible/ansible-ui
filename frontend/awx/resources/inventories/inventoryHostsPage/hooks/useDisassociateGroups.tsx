import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../../common/useAwxBulkConfirmation';
import { useHostsGroupsColumns } from './useHostsGroupsColumns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';

export function useDisassociateGroups(
  onComplete: (groups: InventoryGroup[]) => void,
  hostId: string
) {
  const { t } = useTranslation();
  const confirmationColumns = useHostsGroupsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<InventoryGroup>();
  // const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const disassociateGroups = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Disassociate group from host?', { count: groups.length }),
      confirmText: t(
        'Yes, I confirm that I want to disassociate these {{count}} groups from the inventory.',
        {
          count: groups.length,
        }
      ),
      actionButtonText: t('Disassociate groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: async (group: InventoryGroup, signal) => {
        await postRequest(
          awxAPI`/hosts/${hostId ?? ''}/groups/`,
          {
            disassociate: true,
            id: group.id,
          },
          signal
        );
      },
    });
  };
  return disassociateGroups;
}
