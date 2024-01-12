import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Instance } from '../../interfaces/Instance';
import { useInstanceRowActions } from './hooks/useInstanceRowActions';
import { useInstanceToolbarActions } from './hooks/useInstanceToolbarActions';
import { useInstancesColumns } from './hooks/useInstancesColumns';
import { useInstancesFilters } from './hooks/useInstancesFilter';

export function Instances() {
  const { t } = useTranslation();
  const toolbarFilters = useInstancesFilters();
  const tableColumns = useInstancesColumns();
  const view = useAwxView<Instance>({
    url: awxAPI`/instances/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInstanceToolbarActions(view);
  const rowActions = useInstanceRowActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Instances')}
        description={t(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )}
      />
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
    </PageLayout>
  );
}
