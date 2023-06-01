import { useState, useMemo } from 'react';
import { PageSection, Skeleton } from '@patternfly/react-core';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobStatusBar } from './JobStatusBar';
import { HostStatusBar } from './HostStatusBar';
import { JobOutputToolbar } from './JobOutputToolbar';
import { JobOutputEvents } from './JobOutputEvents';
import type { IToolbarFilter } from '../../../../../framework';

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
`;

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  const toolbarFilters = useOutputFilters();
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  if (!job) {
    return <Skeleton />;
  }
  return (
    <Section variant="light" className="dark-1">
      <JobStatusBar job={job} />
      <HostStatusBar counts={job.host_status_counts || {}} />
      <JobOutputToolbar toolbarFilters={toolbarFilters} filters={filters} setFilters={setFilters} />
      <JobOutputEvents job={job} toolbarFilters={toolbarFilters} filters={filters} />
    </Section>
  );
}

function useOutputFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'stdout',
        label: t('Search output'),
        type: 'string',
        query: 'stdout__icontains',
        placeholder: t('Filter by keyword'),
      },
    ],
    [t]
  );
}
