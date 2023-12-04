import { useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../common/columns';
import { AwxRoute } from '../../../AwxRoutes';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function useManagementJobColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();

  const nameColumn = useNameColumn({
    ...options,
    onClick: (job: SystemJobTemplate) =>
      pageNavigate(AwxRoute.ManagementJobDetails, { params: { id: job.id } }),
  });

  const createdColumn = useCreatedColumn(options);
  const descriptionColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);

  const tableColumns = useMemo<ITableColumn<SystemJobTemplate>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
