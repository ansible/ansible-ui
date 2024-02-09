import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ColumnCardOption,
  ColumnDashboardOption,
  ColumnListOption,
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ElapsedTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../framework';
import { StatusCell } from '../../common/Status';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { UnifiedJob } from '../interfaces/UnifiedJob';
import { AwxRoute } from '../main/AwxRoutes';
import { getLaunchedByDetails, getScheduleUrl, isJobRunning } from '../views/jobs/jobUtils';
import { awxAPI } from './api/awx-utils';

export function useJobIdColumn<T extends UnifiedJob>() {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
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

  return column;
}

export function useJobStatusColumn<T extends UnifiedJob>() {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Status'),
      cell: (job: UnifiedJob) => <StatusCell status={job.status} />,
      sort: 'status',
    }),
    [t]
  );

  return column;
}

export function useJobTypeColumn<T extends UnifiedJob>(
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  dashboardOption?: ColumnDashboardOption
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Type'),
      cell: (job: UnifiedJob) => {
        const jobTypes: { [key: string]: string } = {
          project_update: t`Source control update`,
          inventory_update: t`Inventory sync`,
          job: job.job_type === 'check' ? t`Playbook check` : t`Playbook run`,
          ad_hoc_command: t`Command`,
          system_job: t`Management job`,
          workflow_job: t`Workflow job`,
        };
        return <TextCell text={jobTypes[job.type]} />;
      },
      sort: 'type',
      card: cardOption ?? ColumnCardOption.subtitle,
      list: listOption ?? ColumnListOption.subtitle,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, listOption, t]
  );

  return column;
}

export function useJobDurationColumn<T extends UnifiedJob>(
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Duration'),
      cell: (job: UnifiedJob) =>
        job.started && <ElapsedTimeCell start={job.started} finish={job.finished} />,
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [dashboardOption, modalOption, t]
  );

  return column;
}

export function useJobStartedColumn<T extends UnifiedJob>(
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  listOption?: ColumnListOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Started'),
      cell: (job: UnifiedJob) => job.started && <DateTimeCell value={job.started} />,
      sort: 'started',
      list: listOption ?? ColumnListOption.secondary,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [dashboardOption, defaultSort, listOption, modalOption, t]
  );

  return column;
}

export function useJobSourceColumn<T extends UnifiedJob>(
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventory_sources/`);
  const inventorySourceChoices = useMemo(
    () =>
      data &&
      data.actions &&
      data.actions['GET'] &&
      data.actions['GET'].source &&
      Array.isArray(data.actions['GET'].source.choices)
        ? data.actions['GET'].source.choices
        : [],
    [data]
  );

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Source'),
      cell: (job: UnifiedJob) =>
        inventorySourceChoices?.map(([string, label]) => (string === job.source ? label : null)),
      value: (job: UnifiedJob) => !!job.source,
      table: ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? 'hidden',
    }),
    [cardOption, dashboardOption, defaultSort, inventorySourceChoices, listOption, modalOption, t]
  );

  return column;
}

export function useJobFinishedColumn<T extends UnifiedJob>(
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Finished'),
      cell: (job: UnifiedJob) => job.finished && <DateTimeCell value={job.started} />,
      sort: 'finished',
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.secondary,
      defaultSortDirection: defaultSort ?? 'desc',
      defaultSort: true,
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t]
  );

  return column;
}

export function useJobScheduleColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Schedule'),
      cell: (job: UnifiedJob) => (
        <Link to={job.summary_fields?.schedule ? getScheduleUrl(job) ?? '' : ''}>
          {job.summary_fields?.schedule?.name}
        </Link>
      ),
      value: (job: UnifiedJob) => job.summary_fields?.schedule?.name,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobWorkflowColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Workflow job template'),
      cell: (job: UnifiedJob) => (
        <Link
          to={getPageUrl(AwxRoute.WorkflowJobTemplateDetails, {
            params: { id: job.summary_fields?.workflow_job_template?.id },
          })}
        >
          {job.summary_fields?.workflow_job_template?.name}
        </Link>
      ),
      value: (job: UnifiedJob) => !!job.summary_fields?.workflow_job_template,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, getPageUrl, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobExplanationColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Explanation'),
      cell: (job: UnifiedJob) => job.job_explanation,
      value: (job: UnifiedJob) => job.job_explanation,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobSliceParentColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Job slice parent'),
      cell: (_job: UnifiedJob) => <span>{t`True`}</span>,
      value: (job: UnifiedJob) => job.type === 'workflow_job' && job.is_sliced_job,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobLaunchedByColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Launched by'),
      cell: (job: UnifiedJob) => {
        const { value: launchedByValue, link: launchedByLink } = getLaunchedByDetails(job) ?? {};
        if (launchedByLink) {
          return <Link to={`${launchedByLink}`}>{launchedByValue}</Link>;
        } else {
          return launchedByValue;
        }
      },
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobTemplateColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Job template'),
      cell: (job: UnifiedJob) => (
        <Link
          to={getPageUrl(AwxRoute.JobTemplateDetails, {
            params: { id: job.summary_fields?.job_template?.id },
          })}
        >
          {job.summary_fields?.job_template?.name}
        </Link>
      ),
      value: (job: UnifiedJob) => !!job.summary_fields?.job_template,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, getPageUrl, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useSourceWorkflowColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Source workflow job'),
      cell: (job: UnifiedJob) => (
        <Link
          to={getPageUrl(AwxRoute.JobDetails, {
            params: {
              job_type: 'workflow',
              id: job.summary_fields.source_workflow_job?.id,
            },
          })}
        >
          {job.summary_fields.source_workflow_job?.name}
        </Link>
      ),
      value: (job: UnifiedJob) => !!job.summary_fields?.source_workflow_job,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, getPageUrl, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobSliceColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Job slice'),
      cell: (job: UnifiedJob) => (
        <span>{`${job.job_slice_number ?? 0}/${(job.job_slice_count ?? 0).toString()}`}</span>
      ),
      value: (job: UnifiedJob) => job.job_slice_count,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, listOption, modalOption, t, tableOption]
  );

  return column;
}

export function useJobExecutionEnvColumn<T extends UnifiedJob>(
  tableOption?: ColumnTableOption,
  cardOption?: ColumnCardOption,
  listOption?: ColumnListOption,
  modalOption?: ColumnModalOption,
  dashboardOption?: ColumnDashboardOption,
  defaultSort?: 'asc' | 'desc'
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Execution environment'),
      cell: (job: UnifiedJob) => (
        <Link
          to={getPageUrl(AwxRoute.ExecutionEnvironmentPage, {
            params: { id: job.summary_fields.execution_environment?.id },
          })}
        >
          {job.summary_fields.execution_environment?.name}
        </Link>
      ),
      value: (job: UnifiedJob) =>
        job.type !== 'workflow_job' &&
        !isJobRunning(job.status) &&
        job.status !== 'canceled' &&
        !!job.summary_fields?.execution_environment,
      table: tableOption ?? ColumnTableOption.expanded,
      card: cardOption ?? ColumnCardOption.hidden,
      list: listOption ?? ColumnListOption.hidden,
      defaultSortDirection: defaultSort ?? 'desc',
      modal: modalOption ?? ColumnModalOption.hidden,
      dashboard: dashboardOption ?? ColumnDashboardOption.hidden,
    }),
    [cardOption, dashboardOption, defaultSort, getPageUrl, listOption, modalOption, t, tableOption]
  );

  return column;
}
