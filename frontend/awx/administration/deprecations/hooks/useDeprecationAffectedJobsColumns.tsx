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
            to={getPageUrl(AwxRoute.JobDetails, { params: { id: job.id, job_type: job.type } })}
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
