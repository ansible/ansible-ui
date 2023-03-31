import { PageHeader, PageLayout, PageTable } from '../../../../framework';

import { useTranslation } from 'react-i18next';
import { useAwxView } from '../../useAwxView';
import { useHostMetricsRowActions } from './hooks/useHostMetricsRowActions';
import { useHostMetricsColumns } from './hooks/useHostMetricsColumns';
import { useHostMetricsFilters } from './hooks/useHostMetricsFilters';
import { useHostMetricsToolbarActions } from './hooks/useHostMetricsToolbarActions';
import { HostMetric } from '../../interfaces/HostMetric';

export default function HostMetrics() {
  const { t } = useTranslation();
  const toolbarFilters = useHostMetricsFilters();
  const tableColumns = useHostMetricsColumns();
  const view = useAwxView<HostMetric>({
    url: '/api/v2/host_metrics/',
    queryParams: {
      not__deleted: 'true',
    },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useHostMetricsToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useHostMetricsRowActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Host metrics')}
        titleHelpTitle={t('Host metrics')}
        titleHelp={[
          t(
            'All currently managed hosts, with information about when they were first automated, when they were most recently automated, how many times they were automated, and how many times each host has been deleted.'
          ),
          t(
            'Host metrics can be used to accurately count node usage and ensure subscription compliance. For example, if a host is no longer in use or otherwise should not be counted towards the subscription total, it can be soft-deleted.'
          ),
        ]}
        description={t('hostMetrics.title.description')}
      />
      <PageTable
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading host metrics')}
        emptyStateTitle={t('No host metrics found')}
        emptyStateDescription={t('Please launch a job to populate this list.')}
        {...view}
      />
    </PageLayout>
  );
}
