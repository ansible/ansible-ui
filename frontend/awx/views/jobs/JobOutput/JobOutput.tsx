import { PageSection, Skeleton } from '@patternfly/react-core';
import styled from 'styled-components';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobStatusBar } from './JobStatusBar';
import { HostStatusBar } from './HostStatusBar';
import { JobOutputToolbar } from './JobOutputToolbar';
import { JobOutputEvents } from './JobOutputEvents';

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
`;

export function JobOutput(props: { job: Job }) {
  const { job } = props;

  if (!job) {
    return <Skeleton />;
  }
  return (
    <Section variant="light" className="dark-1">
      <JobStatusBar job={job} />
      <HostStatusBar counts={job.host_status_counts || {}} />
      <JobOutputToolbar job={job} />
      <JobOutputEvents job={job} />
    </Section>
  );
}
