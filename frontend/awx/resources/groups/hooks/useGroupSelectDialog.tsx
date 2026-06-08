import { ITableColumn, MultiSelectDialog } from '@ansible/ansible-ui-framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useGroupsFilters } from './useGroupsFilters';

export interface GroupSelectModalProps {
  groupId: string;
  onSelectedGroups: (groups: InventoryGroup[]) => Promise<void>;
}

export function GroupSelectDialog({ onSelectedGroups, groupId }: GroupSelectModalProps) {
  const { t } = useTranslation();
  const toolbarFilters = useGroupsFilters({
    url: `groups/${groupId}/potential_children`,
    queryParams: {
      not__id: groupId,
      not__parents: groupId,
    },
  });
  const nameColumn = useNameColumn();
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/groups/${groupId}/potential_children/`,
    queryParams: {
      not__id: groupId,
      not__parents: groupId,
    },
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
