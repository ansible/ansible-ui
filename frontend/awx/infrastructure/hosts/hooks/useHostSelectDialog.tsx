import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, MultiSelectDialog } from '../../../../../framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useGroupsFilters } from '../../inventories/groups/hooks/useGroupsFilters';

export interface HostSelectModalProps {
  groupId: string;
  inventoryId: string;
  onSelectedHosts: (groups: AwxHost[]) => Promise<void>;
}

export function HostSelectDialog({ onSelectedHosts, groupId, inventoryId }: HostSelectModalProps) {
  const { t } = useTranslation();
  const toolbarFilters = useGroupsFilters();
  const nameColumn = useNameColumn();
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
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
