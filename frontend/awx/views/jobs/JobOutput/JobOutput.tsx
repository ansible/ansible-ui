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
import styled from 'styled-components';

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
        comparison: 'contains',
      },
      {
        key: 'event',
        label: t('Event'),
        type: 'select',
        query: 'event',
        placeholder: t('Select event type'),
        options: [
          { value: 'debug', label: t('Debug') },
          { value: 'deprecated', label: t('Deprecated') },
          { value: 'error', label: t('Error') },
          { value: 'runner_on_file_diff', label: t('File Difference') },
          { value: 'playbook_on_setup', label: t('Gathering Facts') },
          { value: 'runner_on_async_failed', label: t('Host Async Failure') },
          { value: 'runner_on_async_ok', label: t('Host Async OK') },
          { value: 'runner_on_failed', label: t('Host Failed') },
          { value: 'runner_on_error', label: t('Host Failure') },
          { value: 'runner_on_ok', label: t('Host OK') },
          { value: 'runner_on_async_poll', label: t('Host Polling') },
          { value: 'runner_retry', label: t('Host Retry') },
          { value: 'runner_on_skipped', label: t('Host Skipped') },
          { value: 'runner_on_start', label: t('Host Started') },
          { value: 'runner_on_unreachable', label: t('Host Unreachable') },
          { value: 'playbook_on_include', label: t('Including File') },
          { value: 'runner_item_on_failed', label: t('Item Failed') },
          { value: 'runner_item_on_ok', label: t('Item OK') },
          { value: 'runner_item_on_skipped', label: t('Item Skipped') },
          { value: 'playbook_on_no_hosts_matched', label: t('No Hosts Matched') },
          { value: 'playbook_on_no_hosts_remaining', label: t('No Hosts Remaining') },
          { value: 'runner_on_no_hosts', label: t('No Hosts Remaining') },
          { value: 'playbook_on_play_start', label: t('Play Started') },
          { value: 'playbook_on_stats', label: t('Playbook Complete') },
          { value: 'playbook_on_start', label: t('Playbook Started') },
          { value: 'playbook_on_notify', label: t('Running Handlers') },
          { value: 'system_warning', label: t('System Warning') },
          { value: 'playbook_on_task_start', label: t('Task Started') },
          { value: 'playbook_on_vars_prompt', label: t('Variables Prompted') },
          { value: 'verbose', label: t('Verbose') },
          { value: 'warning', label: t('Warning') },
        ],
      },
    ],
    [t]
  );
}
