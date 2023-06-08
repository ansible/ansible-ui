import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { ElapsedTimeCell } from '../../../../../framework/PageCells/ElapsedTimeCell';
import { StatusCell } from '../../../../common/Status';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { getJobOutputUrl } from '../jobUtils';

export function useJobsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<UnifiedJob>[]>(
    () => [
      {
        header: t('ID'),
        cell: (job: UnifiedJob) => job.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
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
      },
      {
        header: t('Duration'),
        cell: (job: UnifiedJob) =>
          job.started && <ElapsedTimeCell start={job.started} finish={job.finished} />,
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Started'),
        cell: (job: UnifiedJob) =>
          job.started && <DateTimeCell format="date-time" value={job.started} />,
        sort: 'started',
        list: 'secondary',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Finished'),
        cell: (job: UnifiedJob) =>
          job.finished && <DateTimeCell format="date-time" value={job.started} />,
        sort: 'finished',
        card: 'hidden',
        list: 'secondary',
        defaultSortDirection: 'desc',
        defaultSort: true,
        modal: ColumnModalOption.Hidden,
      },
    ],
    [options?.disableLinks, t]
  );
  return tableColumns;
}
