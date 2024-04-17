import { useTranslation } from 'react-i18next';
import { ITableColumn, MultiSelectDialog } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useGroupsFilters } from '../../groups/hooks/useGroupsFilters';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { useMemo } from 'react';
import { AwxHost } from '../../../interfaces/AwxHost';

export interface HostSelectModalProps {
  groupId: string;
  inventoryId: string;
  onSelectedHosts: (groups: AwxHost[]) => Promise<void>;
}

export function HostSelectDialog({ onSelectedHosts, groupId, inventoryId }: HostSelectModalProps) {
  const { t } = useTranslation();
  const nameColumn = useNameColumn();
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  const toolbarFilters = useGroupsFilters({
    url: `inventories/${inventoryId}/hosts/?not__groups=${groupId}`,
  });
  const view = useAwxView<AwxHost>({
    url: awxAPI`/inventories/${inventoryId}/hosts/?not__groups=${groupId}&order_by=name&page=1&page_size=5`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <MultiSelectDialog
      title={t('Select host')}
      onSelect={(hosts) => void onSelectedHosts(hosts)}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Add hosts')}
    />
  );
}
