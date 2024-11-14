import { ColumnTableOption, ITableColumn, usePageNavigate } from '@ansible/ansible-ui-framework';
import {
  useDescriptionColumn,
  useInventoryNameColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
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
