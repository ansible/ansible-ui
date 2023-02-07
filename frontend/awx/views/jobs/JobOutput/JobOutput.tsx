import {
  Label,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ItemsResponse, useGet2 } from '../../../../Data';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobEventsComponent } from './JobOutputEvents';

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  const { data: itemsResponse } = useGet2<ItemsResponse<JobEvent>>({
    url: job
      ? // ? `/api/v2/jobs/${job.id.toString()}/events/?order_by=counter&page=1&page_size=50`
        `/api/v2/jobs/${job.id.toString()}/job_events/`
      : '',
    query: { order_by: 'counter', page: 1, page_size: 10 },
  });

  if (!job) return <Skeleton />;
  if (!itemsResponse) return <></>;
  if (!itemsResponse.results) return <></>;

  const jobEvents = itemsResponse?.results;

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
      <JobEventsComponent jobEvents={jobEvents} />
    </>
  );
}

export interface ICollapsed {
  [uuid: string]: boolean;
}
