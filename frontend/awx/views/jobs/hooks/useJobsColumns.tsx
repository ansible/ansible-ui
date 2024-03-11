import { Chip, ChipGroup, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { ElapsedTimeCell } from '../../../../../framework/PageCells/ElapsedTimeCell';
import { StatusCell } from '../../../../common/Status';
import { useOptions } from '../../../../common/crud/useOptions';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { AwxRoute } from '../../../main/AwxRoutes';
import { getLaunchedByDetails, getScheduleUrl } from '../jobUtils';
import { useGetJobOutputUrl } from '../useGetJobOutputUrl';

export function useJobsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

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

  const getJobOutputUrl = useGetJobOutputUrl();

  const tableColumns = useMemo<ITableColumn<UnifiedJob>[]>(
    () => [
      {
        header: t('ID'),
        cell: (job: UnifiedJob) => job.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        dashboard: 'hidden',
        minWidth: 0,
      },
      {
        header: t('Name'),
        cell: (job: UnifiedJob) => {
          return (
            <TextCell
              text={job.name}
              to={getJobOutputUrl(job)}
              disableLinks={options?.disableLinks}
            />
          );
        },
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (job: UnifiedJob) => <StatusCell status={job.status} />,
        sort: 'status',
      },
      {
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
        card: 'subtitle',
        list: 'subtitle',
        dashboard: 'hidden',
      },
      {
        header: t('Duration'),
        cell: (job: UnifiedJob) =>
          job.started && <ElapsedTimeCell start={job.started} finish={job.finished} />,
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Started'),
        cell: (job: UnifiedJob) => job.started && <DateTimeCell value={job.started} />,
        sort: 'started',
        list: 'secondary',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Finished'),
        cell: (job: UnifiedJob) => (job.finished ? <DateTimeCell value={job.started} /> : '--'),
        sort: 'finished',
        card: 'hidden',
        list: 'secondary',
        defaultSortDirection: 'desc',
        defaultSort: true,
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Source'),
        cell: (job: UnifiedJob) =>
          inventorySourceChoices?.map(([string, label]) => (string === job.source ? label : null)),
        value: (job: UnifiedJob) => (job.source ? job.source : undefined),
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Launched by'),
        cell: (job: UnifiedJob) => {
          const { value: launchedByValue, link: launchedByLink } = getLaunchedByDetails(job) ?? {};
          if (launchedByLink) {
            return <Link to={`${launchedByLink}`}>{launchedByValue}</Link>;
          } else {
            return launchedByValue;
          }
        },
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Schedule'),
        cell: (job: UnifiedJob) => (
          <Link to={job.summary_fields?.schedule ? getScheduleUrl(job) ?? '' : ''}>
            {job.summary_fields?.schedule?.name}
          </Link>
        ),
        value: (job: UnifiedJob) => job.summary_fields?.schedule?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
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
        value: (job: UnifiedJob) => job.summary_fields?.job_template?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
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
        value: (job: UnifiedJob) => job.summary_fields?.workflow_job_template?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
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
        value: (job: UnifiedJob) => job.summary_fields?.source_workflow_job?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Inventory'),
        cell: (job: UnifiedJob) => (
          <Link
            to={getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                inventory_type: inventoryUrlPaths[job.summary_fields?.inventory?.kind ?? ''],
                id: job.summary_fields?.inventory?.id,
              },
            })}
          >
            {job.summary_fields?.inventory?.name}
          </Link>
        ),
        value: (job: UnifiedJob) => job.summary_fields?.inventory?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Project'),
        cell: (job: UnifiedJob) => (
          <Link
            to={getPageUrl(AwxRoute.ProjectDetails, {
              params: { id: job.summary_fields?.project?.id },
            })}
          >
            {job.summary_fields?.project?.name}
          </Link>
        ),
        value: (job: UnifiedJob) => job.summary_fields?.project?.name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
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
          job.summary_fields?.execution_environment
            ? job.summary_fields?.execution_environment.name
            : undefined,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Credentials'),
        cell: (job: UnifiedJob) => (
          <LabelGroup
            numLabels={5}
            collapsedText={t(`{{count}} more`, {
              count: (job.summary_fields.credentials?.length ?? 0) - 5,
            })}
          >
            {job.summary_fields.credentials?.map((cred) => (
              <CredentialLabel credential={cred} key={cred.id} />
            ))}
          </LabelGroup>
        ),
        value: (job: UnifiedJob) =>
          job.summary_fields?.credentials?.length
            ? job.summary_fields?.credentials?.length
            : undefined,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Labels'),
        cell: (job: UnifiedJob) => (
          <ChipGroup
            numChips={5}
            collapsedText={t(`{{count}} more`, {
              count: (job.summary_fields?.labels?.results.length ?? 0) - 5,
            })}
            ouiaId={`job-${job.id}-label-chips`}
          >
            {job.summary_fields?.labels?.results.map((l) => (
              <Chip key={l.id} isReadOnly ouiaId={`label-${l.id}-chip`}>
                {l.name}
              </Chip>
            ))}
          </ChipGroup>
        ),
        value: (job: UnifiedJob) =>
          job.summary_fields?.labels?.results.length
            ? job.summary_fields?.labels?.results.length
            : undefined,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Explanation'),
        cell: (job: UnifiedJob) => job.job_explanation,
        value: (job: UnifiedJob) => (job.job_explanation ? job.job_explanation : undefined),
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Job slice'),
        cell: (job: UnifiedJob) => (
          <span>{`${job.job_slice_number ?? 0}/${(job.job_slice_count ?? 0).toString()}`}</span>
        ),
        value: (job: UnifiedJob) => job.job_slice_count,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
      {
        header: t('Job slice parent'),
        cell: (_job: UnifiedJob) => <span>{t`True`}</span>,
        value: (job: UnifiedJob) => job.type === 'workflow_job' && job.is_sliced_job,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'hidden',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
        dashboard: 'hidden',
      },
    ],
    [getJobOutputUrl, getPageUrl, inventorySourceChoices, options?.disableLinks, t]
  );
  return tableColumns;
}

const inventoryUrlPaths: { [key: string]: string } = {
  '': 'inventory',
  smart: 'smart_inventory',
  constructed: 'constructed_inventory',
};
