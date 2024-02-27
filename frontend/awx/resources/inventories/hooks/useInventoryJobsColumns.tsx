import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, DateTimeCell, ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
} from '../../../../common/columns';
// import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoryJobsExpandedColumns } from '../hooks/useInventoryJobsExpandedColumns';
// import { useProjectNameColumn } from './useProjectNameColumn';
import { useInventoryJobsStatusColumn } from '../hooks/useInventoryJobsStatusColumn';
import { useInventoryJobsNameColumn } from '../hooks/useInventoryJobsNameColumn';
import { Job } from '../../../interfaces/Job';

export function useInventoryJobsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const nameColumn = useInventoryJobsNameColumn();
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const statusColumn = useInventoryJobsStatusColumn({
    ...options,
    tooltip: t`Click to view the latest job output`,
  });
  const expandedColumns = useInventoryJobsExpandedColumns();
  const tableColumns = useMemo<ITableColumn<Job>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      statusColumn,
      {
        header: t('Start Time'),
        cell: (job) => <DateTimeCell value={job.started} />,
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
      {
        header: t('Finish Time'),
        cell: (job) => <DateTimeCell value={job.finished} />,
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
      createdColumn,
      modifiedColumn,
      ...expandedColumns,
    ],
    [createdColumn, descriptionColumn, expandedColumns, modifiedColumn, nameColumn, statusColumn, t]
  );
  return tableColumns;
}
