import {
  IToolbarFilter,
  PageTable,
  ToolbarFilterType,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { Content, ToolbarItem } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';
import { useDeprecationAffectedJobsColumns } from './hooks/useDeprecationAffectedJobsColumns';
import { useDeprecationData, TimeRange } from './hooks/useDeprecationData';

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

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7d': 'Showing jobs from last 7 days',
  '30d': 'Showing jobs from last 30 days',
  '6m': 'Showing jobs from last 6 months',
  '1y': 'Showing jobs from last year',
  all: 'Showing all jobs',
};

export function DeprecationAffectedJobs() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const decodedType = decodeURIComponent(deprecationType ?? '');

  const [searchParams] = useSearchParams();
  const timeRange = (searchParams.get('timeRange') ?? '7d') as TimeRange;

  const { data: deprecationData } = useDeprecationData(timeRange);
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

  const columns = useDeprecationAffectedJobsColumns();

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
      toolbarRightContent={
        <ToolbarItem>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            {t(TIME_RANGE_LABELS[timeRange])}
          </Content>
        </ToolbarItem>
      }
    />
  );
}
