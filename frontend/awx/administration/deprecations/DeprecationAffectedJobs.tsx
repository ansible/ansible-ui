import {
  DateTimeCell,
  ITableColumn,
  IToolbarFilter,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { useDeprecationData } from './hooks/useDeprecationData';

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

export function DeprecationAffectedJobs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const decodedType = decodeURIComponent(deprecationType ?? '');

  const { data: deprecationData } = useDeprecationData();
  const deprecation = deprecationData?.deprecations.find((d) => d.type === decodedType);
  const jobIds = deprecation?.jobIds ?? [];

  const { data: jobsResponse } = useSWR(
    jobIds.length > 0 ? ['deprecation-affected-jobs', jobIds.join(',')] : null,
    () =>
      requestGet<{ results: AffectedJob[]; count: number }>(
        awxAPI`/jobs/?id__in=${jobIds.join(',')}&page_size=${String(jobIds.length)}`
      )
  );

  const jobs = useMemo<AffectedJob[]>(() => {
    if (!jobsResponse?.results || !deprecation) return [];
    return jobsResponse.results.map((job) => ({
      ...job,
      occurrences: deprecation.jobOccurrences[job.id] ?? 0,
    }));
  }, [jobsResponse, deprecation]);

  const columns = useMemo<ITableColumn<AffectedJob>[]>(
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

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.Search,
        query: 'name',
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.SingleSelect,
        query: 'status',
        placeholder: t('Filter by status'),
        options: [
          { label: t('Successful'), value: 'successful' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Running'), value: 'running' },
          { label: t('Pending'), value: 'pending' },
        ],
      },
    ],
    [t]
  );

  const view = useInMemoryView<AffectedJob>({
    items: jobs,
    tableColumns: columns,
    toolbarFilters,
    keyFn: (job) => job.id,
    disableQueryString: true,
  });

  return (
    <PageTable<AffectedJob>
      {...view}
      tableColumns={columns}
      toolbarFilters={toolbarFilters}
      keyFn={(job) => job.id}
      emptyStateTitle={t('No affected jobs')}
      emptyStateDescription={t('No jobs have been recorded for this deprecation pattern.')}
      errorStateTitle={t('Error loading affected jobs')}
    />
  );
}
