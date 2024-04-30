import { JobEvent } from '../../../interfaces/JobEvent';

export type JobStatus =
  | 'new'
  | 'pending'
  | 'waiting'
  | 'running'
  | 'successful'
  | 'failed'
  | 'error'
  | 'canceled';

const runningJobTypes: string[] = ['new', 'pending', 'waiting', 'running'];

export function isJobRunning(jobStatus?: JobStatus) {
  return !jobStatus || runningJobTypes.includes(jobStatus);
}

export function isHostEvent(jobEvent: JobEvent) {
  const { event, event_data, host, type } = jobEvent;
  let isHost;

  if (typeof host === 'number' || (event_data && event_data.res)) {
    isHost = true;
  } else if (type === 'project_update_event' && event !== 'runner_on_skipped' && event_data?.host) {
    isHost = true;
  } else {
    isHost = false;
  }
  return isHost;
}
