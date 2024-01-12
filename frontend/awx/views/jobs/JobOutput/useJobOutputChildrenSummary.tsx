import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Job } from '../../../interfaces/Job';

export interface IJobOutputChildrenSummary {
  children_summary: { [counter: string]: { rowNumber: number; numChildren: number } };
  meta_event_nested_uuid: object;
  event_processing_finished: boolean;
  is_tree: boolean;
}

export function useJobOutputChildrenSummary(job: Job, forceFlatMode: boolean) {
  let isFlatMode = forceFlatMode || job.type !== 'job';

  const response = useGet<IJobOutputChildrenSummary>(
    awxAPI`/jobs/${job.id.toString()}/job_events/children_summary/`
  );
  const { data, error } = response;

  if (error) {
    isFlatMode = true;
  }
  return {
    childrenSummary: isFlatMode || !data ? undefined : data,
    isFlatMode: isFlatMode || !data,
  };
}
