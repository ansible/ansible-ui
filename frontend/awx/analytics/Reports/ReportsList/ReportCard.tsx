import { useTranslation } from 'react-i18next';
import { PageTable } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { ReportsList } from '../../../interfaces/ReportsList';
import { useAnalyticsView } from '../../useAnalyticsView';
import { useReportCardColumns } from './useReportCardColumns';
import { useReportCardFilters } from './useReportCardFilters';

export interface ReportCardProps {
  meta: { count: number; filtered_query_count: number };
  reports: [];
}

export interface ReportCardPayloadData {
  name: [];
  description: string;
  slug: [];
  tags: [];
}

export function ReportCard() {
  const { t } = useTranslation();
  const toolbarFilters = useReportCardFilters();
  const tableColumns = useReportCardColumns();

  const view = useAnalyticsView<ReportsList>({
    url: awxAPI`/analytics/reports/`,
    keyFn: (data) => data.id,
    payload: {
      description: '',
      limit: '20',
      name: [],
      offset: '0',
      slug: [],
      sort_options: 'name',
      sort_order: 'asc',
      tags: [],
    },
    requestMethod: 'post',
    getItems: (data: ReportCardProps) => data.reports,
    getItemsCount: (data: ReportCardProps) => data.meta.count,
    itemsPerPage: 20,
    toolbarFilters: toolbarFilters,
    tableColumns: tableColumns,
  });

  return (
    <PageTable
      disableListView
      disableTableView
      disablePagination
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading reports list')}
      emptyStateTitle={t('No reports found')}
      {...view}
    />
  );
}
