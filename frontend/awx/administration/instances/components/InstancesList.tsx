import { useTranslation } from 'react-i18next';
import { IPageAction, ITableColumn, PageTable } from '../../../../../framework';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView, useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useInstancesFilters } from '../hooks/useInstancesFilter';

export function InstancesList(props: {
  useToolbarActions: (view: IAwxView<Instance>) => IPageAction<Instance>[];
  useRowActions: (onComplete: (instances: Instance[]) => void) => IPageAction<Instance>[];
  tableColumns: ITableColumn<Instance>[];
  instanceGroupId?: string;
}) {
  const toolbarFilters = useInstancesFilters();
  const { t } = useTranslation();

  const { useToolbarActions, useRowActions, tableColumns, instanceGroupId } = props;

  const defaultParams: {
    not__node_type: string;
  } = {
    not__node_type: 'control,hybrid',
  };

  const view = useAwxView<Instance>({
    url: instanceGroupId
      ? awxAPI`/instance_groups/${instanceGroupId}/instances/`
      : awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
    queryParams: defaultParams,
  });

  const rowActions = useRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useToolbarActions(view);

  usePersistentFilters('instances');

  return (
    <PageTable<Instance>
      id="awx-instances-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading instances')}
      emptyStateTitle={t('No instances yet')}
      {...view}
    />
  );
}
