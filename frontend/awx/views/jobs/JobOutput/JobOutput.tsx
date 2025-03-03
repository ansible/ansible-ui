import { IFilterState } from '@ansible/ansible-ui-framework';
import { PageSection, Skeleton } from '@patternfly/react-core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { Job } from '../../../interfaces/Job';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { useGetJob } from '../JobPage';
import { WorkflowOutput } from '../WorkflowOutput/WorkflowOutput';
import './JobOutput.css';
import { JobOutputEvents } from './JobOutputEvents';
import { JobOutputToolbar } from './JobOutputToolbar';
import { JobStatusBar } from './JobStatusBar';
import { HostStatusBar, WorkflowNodesStatusBar } from './StatusBar';
import { isJobRunning } from './util';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import { useSearchToolbarFilter } from '../../../common/awx-toolbar-filters';

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
`;

export function JobOutput() {
  const params = useParams<{ id: string; job_type: string }>();
  const { job, refreshJob } = useGetJob(params.id, params.job_type);

  if (!job) {
    return null;
  }
  return <JobOutputInner job={job} reloadJob={refreshJob} />;
}

export function JobOutputInner(props: { job: Job; reloadJob: () => void }) {
  const { job, reloadJob } = props;
  const toolbarFilters = useOutputFilters(job);
  const [filterState, setFilterState] = useState<IFilterState>({});
  const isRunning = isJobRunning(job.status);
  const [isFollowModeEnabled, setIsFollowModeEnabled] = useState(isRunning);

  const { results: workflowNodes, refresh } = useAwxGetAllPages<WorkflowNode>(
    awxAPI`/workflow_jobs/${props.job.id.toString() || ''}/workflow_nodes/`
  );

  if (!job) {
    return <Skeleton />;
  }
  return (
    <Section variant="light">
      <JobStatusBar job={job} />
      {job.type === 'workflow_job' ? (
        <WorkflowNodesStatusBar nodes={workflowNodes || []} />
      ) : (
        <>
          <HostStatusBar counts={job.host_status_counts || {}} />
          <JobOutputToolbar
            toolbarFilters={toolbarFilters}
            filterState={filterState}
            setFilterState={setFilterState}
            jobStatus={job.status}
            isFollowModeEnabled={isFollowModeEnabled}
            setIsFollowModeEnabled={setIsFollowModeEnabled}
          />
        </>
      )}
      {job.type === 'workflow_job' ? (
        <WorkflowOutput job={job} reloadJob={reloadJob} refreshNodeStatus={refresh} />
      ) : (
        <JobOutputEvents
          job={job}
          reloadJob={reloadJob}
          toolbarFilters={toolbarFilters}
          filterState={filterState}
          isFollowModeEnabled={isFollowModeEnabled}
          setIsFollowModeEnabled={setIsFollowModeEnabled}
        />
      )}
    </Section>
  );
}

function useOutputFilters(job: Job) {
  const searchFilter = useSearchToolbarFilter();
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: `jobs/${job.id}/job_events`,
    preSortedKeys: ['search', 'event', 'stdout'],
    additionalFilters: [searchFilter],
  });

  return toolBarFilters;
}
