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
