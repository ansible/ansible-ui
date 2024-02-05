import { useTranslation } from 'react-i18next';
import { MultiSelectDialog } from '../../../../../framework';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useRelatedGroupsColumns } from './useRelatedGroupsColumns';
import { useGroupsFilters } from './useGroupsFilters';

export interface GroupSelectModalProps {
  inventoryId: string;
  groupId: string;
  onSelectedGroups: (groups: InventoryGroup[]) => Promise<void>;
}

export function GroupSelectDialog({
  inventoryId,
  onSelectedGroups,
  groupId,
}: GroupSelectModalProps) {
  const { t } = useTranslation();
  const toolbarFilters = useGroupsFilters();
  const tableColumns = useRelatedGroupsColumns();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${inventoryId}/groups/?not__id=${groupId}&not__parents=${groupId}&order_by=name&page=1&page_size=5`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <MultiSelectDialog
      title={t('Select groups')}
      onSelect={(groups) => void onSelectedGroups(groups)}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Add groups')}
    />
  );
}
