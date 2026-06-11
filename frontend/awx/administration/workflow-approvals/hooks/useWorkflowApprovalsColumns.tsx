import {
  ColumnModalOption,
  DateTimeCell,
  ITableColumn,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useIdColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { AwxRoute } from '../../../main/AwxRoutes';
import { WorkflowApprovalStatusCell } from '../components/WorkflowApprovalStatusCell';

export function useWorkflowApprovalsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const idColumn = useIdColumn(false);
  const nameTo = useCallback(
    (workflow_approval: WorkflowApproval) =>
      getPageUrl(AwxRoute.WorkflowApprovalDetails, { params: { id: workflow_approval.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
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
