import {
  Label,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobEventsComponent } from './JobOutputEvents';

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  if (!job) return <Skeleton />;
  return (
    <>
      <Toolbar className="dark-2 border-bottom">
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput />
          </ToolbarItem>
          <div style={{ flexGrow: 1 }} />
          <ToolbarItem>
            Plays <Label>{job.playbook_counts.play_count ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Tasks <Label>{job.playbook_counts.task_count ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Hosts{' '}
            <Label>{job.host_status_counts.ok ?? 0 + job.host_status_counts.failures ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Failed <Label>{job.host_status_counts.failures ?? 0}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Elapsed <Label>{job.elapsed}</Label>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <JobEventsComponent job={job} />
    </>
  );
}
