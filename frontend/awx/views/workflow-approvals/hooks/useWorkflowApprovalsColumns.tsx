import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  usePageNavigate,
} from '../../../../../framework';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { WorkflowApprovalStatusCell } from '../components/WorkflowApprovalStatusCell';
import { AwxRoute } from '../../../AwxRoutes';
import { useIdColumn, useNameColumn } from '../../../../common/columns';
import { RouteObj } from '../../../../common/Routes';

export function useWorkflowApprovalsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const idColumn = useIdColumn();
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
        header: t('Workflow Job'),
        cell: (workflow_approval: WorkflowApproval) => {
          return (
            <TextCell
              text={`${workflow_approval.summary_fields.source_workflow_job.id} - ${workflow_approval.summary_fields.source_workflow_job.name}`}
              to={RouteObj.JobOutput.replace(':job_type', 'workflow').replace(
                ':id',
                workflow_approval.summary_fields.source_workflow_job.id.toString()
              )}
              disableLinks={options?.disableLinks}
            />
          );
        },
        sort: undefined,
        list: 'secondary',
      },
      {
        header: t('Started'),
        cell: (workflow_approval: WorkflowApproval) =>
          workflow_approval.started && (
            <DateTimeCell format="date-time" value={workflow_approval.started} />
          ),
        sort: 'started',
        list: 'secondary',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.Hidden,
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
    [idColumn, nameColumn, options?.disableLinks, t]
  );
  return tableColumns;
}
