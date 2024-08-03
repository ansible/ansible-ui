import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn, DateTimeCell } from '../../../../../../framework';
import { StatusCell } from '../../../../../common/Status';
import {
  useInventoryNameColumn,
  useNameColumn,
  useProjectNameColumn,
} from '../../../../../common/columns';
import {
  useJobExecutionEnvColumn,
  useJobLaunchedByColumn,
  useJobScheduleColumn,
  useJobSliceColumn,
  useJobTemplateColumn,
  useJobTypeColumn,
  useSourceWorkflowColumn,
} from '../../../../common/JobColumns';
import { UnifiedJob } from '../../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useInstanceGroupJobsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();

  const IDColumns = useMemo<ITableColumn<UnifiedJob>>(
    () => ({
      header: t('ID'),
      cell: (job: UnifiedJob) => job.id,
      sort: 'id',
      card: 'hidden',
      list: 'hidden',
      dashboard: 'hidden',
      minWidth: 0,
    }),
    [t]
  );

  const jobPaths = useMemo<{ [key: string]: string }>(
    () => ({
      project_update: 'project',
      inventory_update: 'inventory',
      job: 'playbook',
      ad_hoc_command: 'command',
      system_job: 'management',
      workflow_job: 'workflow',
    }),
    []
  );

  const nameClick = useCallback(
    (job: UnifiedJob) =>
      pageNavigate(AwxRoute.JobDetails, {
        params: {
          id: job.id,
          job_type: jobPaths[job.type],
        },
      }),
    [jobPaths, pageNavigate]
  );

  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
    defaultSort: false,
  });

  const statusColumn = useMemo<ITableColumn<UnifiedJob>>(
    () => ({
      header: t('Status'),
      cell: (job: UnifiedJob) => {
        return <StatusCell status={job.status} />;
      },
      sort: 'status',
    }),
    [t]
  );

  const startTimeColumn = useMemo<ITableColumn<UnifiedJob>>(
    () => ({
      header: t('Started'),
      cell: (job: UnifiedJob) => {
        return <DateTimeCell value={job.started} />;
      },
      sort: 'started',
    }),
    [t]
  );

  const finishTimeColumn = useMemo<ITableColumn<UnifiedJob>>(
    () => ({
      header: t('Finished'),
      cell: (job: UnifiedJob) => {
        return <DateTimeCell value={job.finished} />;
      },
      sort: 'finished',
      defaultSortDirection: 'desc',
      defaultSort: true,
    }),
    [t]
  );

  const typeColumn = useJobTypeColumn();
  const launchedByColumn = useJobLaunchedByColumn();
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails);
  const jobSliceColumn = useJobSliceColumn();
  const jobTemplateColumn = useJobTemplateColumn();
  const sourceWorkflowColumn = useSourceWorkflowColumn();
  const projectNameColumn = useProjectNameColumn(AwxRoute.ProjectDetails);
  const executionEnvColumn = useJobExecutionEnvColumn();
  const scheduleColumn = useJobScheduleColumn();

  const tableColumns = useMemo<ITableColumn<UnifiedJob>[]>(() => {
    const displayColumns = [
      IDColumns,
      nameColumn,
      statusColumn,
      typeColumn,
      startTimeColumn,
      finishTimeColumn,
      launchedByColumn,
      scheduleColumn,
      jobTemplateColumn,
      sourceWorkflowColumn,
      inventoryColumn,
      projectNameColumn,
      executionEnvColumn,
      jobSliceColumn,
    ];
    return displayColumns;
  }, [
    IDColumns,
    nameColumn,
    statusColumn,
    typeColumn,
    startTimeColumn,
    finishTimeColumn,
    launchedByColumn,
    scheduleColumn,
    jobTemplateColumn,
    sourceWorkflowColumn,
    inventoryColumn,
    projectNameColumn,
    executionEnvColumn,
    jobSliceColumn,
  ]);
  return tableColumns;
}
