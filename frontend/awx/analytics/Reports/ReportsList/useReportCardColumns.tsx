import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { ReportsList } from '../../../interfaces/ReportsList';

export function useReportCardColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<ReportsList>[]>(
    () => [
      {
        header: t('Name'),
        cell: (report) => (
          <TextCell
            text={report.name}
            to={`/ui_next/analytics/builder?reportName=${report.slug}`}
          />
        ),
        sort: 'name',
        card: 'name',
        defaultSortDirection: 'asc',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (report) => report.description,
        sort: 'description',
        card: 'description',
      },
      {
        header: t('Tags'),
        type: 'labels',
        value: (report) => report.tags,
        sort: 'tags',
      },
    ],
    [t]
  );
  return tableColumns;
}
