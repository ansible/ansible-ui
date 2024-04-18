import { useTranslation } from 'react-i18next';
import { IPageAction, PageTable } from '../../../../../framework';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView, useAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useInstanceRowActions } from '../hooks/useInstanceRowActions';
import { useInstancesFilters } from '../hooks/useInstancesFilter';
import { useInstancesColumns } from '../hooks/useInstancesColumns';

export function InstancesList(props: {
  useToolbarActions: (view: IAwxView<Instance>) => IPageAction<Instance>[];
  id?: string;
}) {
  const tableColumns = useInstancesColumns();
  const toolbarFilters = useInstancesFilters();
  const { t } = useTranslation();

  const { useToolbarActions, id } = props;

  const defaultParams: {
    not__node_type: string;
  } = {
    not__node_type: 'control,hybrid',
  };

  const view = useAwxView<Instance>({
    url: id ? awxAPI`/instance_groups/${id}/instances/` : awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
    queryParams: defaultParams,
  });

  const rowActions = useInstanceRowActions(view.unselectItemsAndRefresh);
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
