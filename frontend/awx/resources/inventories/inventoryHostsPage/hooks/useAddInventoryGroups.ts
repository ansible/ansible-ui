import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { getItemKey, postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../../common/useAwxBulkConfirmation';
import { useHostsGroupsColumns } from './useHostsGroupsColumns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useParams } from 'react-router-dom';

export function useAddInventoryGroups(onComplete: (groups: InventoryGroup[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHostsGroupsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const addActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [addActionNameColumn], [addActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<InventoryGroup>();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const addGroups = (groups: InventoryGroup[]) => {
    bulkAction({
      title: t('Add groups to inventory', { count: groups.length }),
      confirmText: t('Yes, I confirm that I want to add these {{count}} groups.', {
        count: groups.length,
      }),
      actionButtonText: t('Add groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: async (group: InventoryGroup, signal) => {
        await postRequest(
          awxAPI`/hosts/${params.host_id ?? ''}/groups/`,
          {
            id: group.id,
          },
          signal
        );
      },
    });
  };
  return addGroups;
}
