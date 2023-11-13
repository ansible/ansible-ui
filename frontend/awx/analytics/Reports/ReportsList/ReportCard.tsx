import { useTranslation } from 'react-i18next';
import { PageTable } from '../../../../../framework';
import { useAnalyticsView } from '../../useAnalyticsView';
import { ReportsList } from '../../../interfaces/ReportsList';
import { useReportCardColumns } from './useReportCardColumns';

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
  const tableColumns = useReportCardColumns();

  const view = useAnalyticsView<ReportsList>({
    url: '/api/v2/analytics/reports/',
    keyFn: (data) => data.id,
    payload: (data: ReportCardPayloadData) => data,
    requestMethod: 'post',
    getItems: (data: ReportCardProps) => data.reports,
    getItemsCount: (data: ReportCardProps) => data.meta.count,
    itemsPerPage: 20,
    disableQueryString: true,
  });

  return (
    <PageTable
      disableListView
      disableTableView
      disablePagination
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading reports list')}
      emptyStateTitle={t('No reports found')}
      {...view}
    />
  );
}
