import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn, DateTimeCell } from '../../../../../../framework';
import {
  useInventoryNameColumn,
  useNameColumn,
  useProjectNameColumn,
} from '../../../../../common/columns';
import { StatusCell } from '../../../../../common/Status';
import {
  useJobLaunchedByColumn,
  useJobSliceColumn,
  useJobTemplateColumn,
  useSourceWorkflowColumn,
  useJobExecutionEnvColumn,
} from '../../../../common/JobColumns';
import { UnifiedJob } from '../../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useHostsJobsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();

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
      header: t('Start Time'),
      cell: (job: UnifiedJob) => {
        return <DateTimeCell value={job.started} format="date-time" />;
      },
      sort: 'started',
    }),
    [t]
  );

  const finishTimeColumn = useMemo<ITableColumn<UnifiedJob>>(
    () => ({
      header: t('Finish Time'),
      cell: (job: UnifiedJob) => {
        return <DateTimeCell value={job.finished} format="date-time" />;
      },
      sort: 'finished',
    }),
    [t]
  );

  const launchedByColumn = useJobLaunchedByColumn();
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails);
  const jobSliceColumn = useJobSliceColumn();
  const jobTemplateColumn = useJobTemplateColumn();
  const sourceWorkflowColumn = useSourceWorkflowColumn();
  const projectNameColumn = useProjectNameColumn(AwxRoute.ProjectDetails);
  const executionEnvColumn = useJobExecutionEnvColumn();

  const tableColumns = useMemo<ITableColumn<UnifiedJob>[]>(() => {
    const displayColumns = [
      nameColumn,
      statusColumn,
      startTimeColumn,
      finishTimeColumn,
      launchedByColumn,
      jobTemplateColumn,
      sourceWorkflowColumn,
      inventoryColumn,
      projectNameColumn,
      executionEnvColumn,
      jobSliceColumn,
    ];
    return displayColumns;
  }, [
    nameColumn,
    statusColumn,
    startTimeColumn,
    finishTimeColumn,
    launchedByColumn,
    jobTemplateColumn,
    sourceWorkflowColumn,
    inventoryColumn,
    projectNameColumn,
    executionEnvColumn,
    jobSliceColumn,
  ]);
  return tableColumns;
}
