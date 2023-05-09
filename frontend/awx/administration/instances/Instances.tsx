import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { Instance } from '../../interfaces/Instance';
import { useAwxView } from '../../useAwxView';
import { useInstancesColumns } from './hooks/useInstancesColumns';
import { useInstancesFilters } from './hooks/useInstancesFilter';
import { useInstanceToolbarActions } from './hooks/useInstanceToolbarActions';
import { useInstanceRowActions } from './hooks/useInstanceRowActions';

export function Instances() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useInstancesFilters();
  const tableColumns = useInstancesColumns();
  const view = useAwxView<Instance>({
    url: '/api/v2/instances/',
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
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instances')}
        emptyStateTitle={t('No instances yet')}
        emptyStateDescription={t('To get started, create an instance.')}
        emptyStateButtonText={t('Create instance')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateInstance)}
        {...view}
      />
    </PageLayout>
  );
}
