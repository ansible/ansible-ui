import { useGet2 } from '../../../../Data';
import { Job } from '../../../interfaces/Job';

export interface IJobOutputChildrenSummary {
  children_summary: { [counter: string]: { rowNumber: number; numChildren: number } };
  meta_event_nested_uuid: object;
  event_processing_finished: boolean;
  is_tree: boolean;
}

export function useJobOutputChildrenSummary(job: Job, isJobRunning: boolean) {
  let isFlatMode = isJobRunning || location.search.length > 1 || job.type !== 'job';
  const response = useGet2<IJobOutputChildrenSummary>({
    url: `/api/v2/jobs/${job.id}/job_events/children_summary/`,
  });
  const { data, error } = response;

  if (error) {
    isFlatMode = true;
  }
  return {
    childrenSummary: isFlatMode || !data ? undefined : data,
    isFlatMode: isFlatMode || !data,
  };
}
