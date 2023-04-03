import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, SinceCell, TextCell } from '../../../../../framework';
import { ElapsedTimeCell } from '../../../../../framework/PageCells/ElapsedTimeCell';
import { StatusCell } from '../../../../common/StatusCell';
import { getJobOutputUrl } from '../jobUtils';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

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
            project_update: t`Source Control Update`,
            inventory_update: t`Inventory Sync`,
            job: job.job_type === 'check' ? t`Playbook Check` : t`Playbook Run`,
            ad_hoc_command: t`Command`,
            system_job: t`Management Job`,
            workflow_job: t`Workflow Job`,
          };
          return <TextCell text={jobTypes[job.type]} />;
        },
        sort: 'type',
        card: 'description',
      },
      {
        header: t('Duration'),
        cell: (job: UnifiedJob) =>
          job.started && <ElapsedTimeCell start={job.started} finish={job.finished} />,
        list: 'secondary',
      },
      {
        header: t('Started'),
        cell: (job: UnifiedJob) => job.started && <p>{formatDateString(job.started)}</p>,
        sort: 'started',
        list: 'secondary',
        defaultSortDirection: 'desc',
      },
      {
        header: t('Finished'),
        cell: (job: UnifiedJob) => job.finished && <p>{formatDateString(job.finished)}</p>,
        sort: 'finished',
        card: 'hidden',
        list: 'secondary',
        defaultSortDirection: 'desc',
        defaultSort: true,
      },
    ],
    [options?.disableLinks, t]
  );
  return tableColumns;
}
