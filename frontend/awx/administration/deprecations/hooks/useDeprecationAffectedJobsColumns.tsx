import { DateTimeCell, ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxRoute } from '../../../main/AwxRoutes';

interface AffectedJob {
  id: number;
  name: string;
  type: string;
  status: string;
  started: string;
  finished: string;
  occurrences: number;
  summary_fields: {
    job_template?: { name: string };
  };
}

const JOB_TYPE_TO_PATH: Record<string, string> = {
  project_update: 'project',
  inventory_update: 'inventory',
  job: 'playbook',
  ad_hoc_command: 'command',
  system_job: 'management',
  workflow_job: 'workflow',
};

export function useDeprecationAffectedJobsColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<AffectedJob>[]>(
    () => [
      {
        header: t('ID'),
        cell: (job) => <TextCell text={String(job.id)} />,
        sort: 'id',
        minWidth: 0,
        card: 'hidden',
        list: 'hidden',
      },
      {
        header: t('Name'),
        cell: (job) => (
          <TextCell
            text={job.summary_fields.job_template?.name ?? job.name}
            to={getPageUrl(AwxRoute.JobDetails, {
              params: { id: job.id, job_type: JOB_TYPE_TO_PATH[job.type] ?? job.type },
            })}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (job) => <StatusCell status={job.status} />,
        sort: 'status',
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Occurrences'),
        cell: (job) => <TextCell text={String(job.occurrences)} />,
        sort: 'occurrences',
        minWidth: 0,
      },
      {
        header: t('Started'),
        cell: (job) => <DateTimeCell value={job.started || undefined} />,
        sort: 'started',
      },
      {
        header: t('Finished'),
        cell: (job) => <DateTimeCell value={job.finished || undefined} />,
        sort: 'finished',
        defaultSort: true,
        defaultSortDirection: 'desc',
      },
    ],
    [t, getPageUrl]
  );
}
