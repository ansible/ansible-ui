import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  DateTimeCell,
  ITableColumn,
  usePageNavigate,
} from '../../../../../framework';
import { useIdColumn, useNameColumn } from '../../../../common/columns';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { AwxRoute } from '../../../main/AwxRoutes';
import { WorkflowApprovalStatusCell } from '../components/WorkflowApprovalStatusCell';

export function useWorkflowApprovalsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const idColumn = useIdColumn(false);
  const nameClick = useCallback(
    (workflow_approval: WorkflowApproval) =>
      pageNavigate(AwxRoute.WorkflowApprovalDetails, { params: { id: workflow_approval.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const tableColumns = useMemo<ITableColumn<WorkflowApproval>[]>(
    () => [
      idColumn,
      nameColumn,
      {
        header: t('Started'),
        cell: (workflow_approval: WorkflowApproval) =>
          workflow_approval.started && <DateTimeCell value={workflow_approval.started} />,
        sort: 'started',
        list: 'secondary',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Status'),
        cell: (workflow_approval: WorkflowApproval) => (
          <WorkflowApprovalStatusCell workflow_approval={workflow_approval} />
        ),
        sort: 'status',
        defaultSortDirection: 'desc',
      },
    ],
    [idColumn, nameColumn, t]
  );
  return tableColumns;
}
