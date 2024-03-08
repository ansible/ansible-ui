import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn, ColumnTableOption } from '../../../../../framework';
import {
  useNameColumn,
  useDescriptionColumn,
  useInventoryNameColumn,
} from '../../../../common/columns';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useTranslation } from 'react-i18next';
import { Sparkline } from '../../templates/components/Sparkline';

function useActivityColumn() {
  const { t } = useTranslation();
  const column: ITableColumn<AwxHost> = useMemo(
    () => ({
      header: t('Activity'),
      cell: (item) => {
        const recentPlaybookJobs = item.summary_fields.recent_jobs.map((job) => ({
          ...job,
          canceled_on: null,
        }));

        if (item.summary_fields?.recent_jobs && item.summary_fields.recent_jobs.length > 0) {
          return <Sparkline jobs={recentPlaybookJobs} />;
        } else {
          return t('No job data available');
        }
      },
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
    }),
    [t]
  );
  return column;
}

export function useHostsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (host: AwxHost) => pageNavigate(AwxRoute.HostDetails, { params: { id: host.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn({
    tableViewOption: undefined,
    disableSort: false,
  });
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, {
    tableViewOption: undefined,
  });
  const activityColumn = useActivityColumn();
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, inventoryColumn, activityColumn],
    [nameColumn, descriptionColumn, inventoryColumn, activityColumn]
  );
  return tableColumns;
}
