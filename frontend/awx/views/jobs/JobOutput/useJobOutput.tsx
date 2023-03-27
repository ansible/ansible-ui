import { useCallback, useRef, useState } from 'react';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { Job } from '../../../interfaces/Job';
import { JobEvent } from '../../../interfaces/JobEvent';

export function useJobOutput(job: Job, pageSize: number) {
  const isQuerying = useRef({ querying: false });
  const [jobEventCount, setJobEventCount] = useState(1);
  const [jobEvents, setJobEvents] = useState<Record<number, JobEvent>>({});

  const getJobOutputEvent = useCallback((counter: number) => jobEvents[counter + 1], [jobEvents]);

  const queryJobOutputEvent = useCallback(
    (counter: number) => {
      const jobEvent = jobEvents[counter + 1];
      if (!jobEvent && !isQuerying.current.querying) {
        isQuerying.current.querying = true;

        const page = Math.floor((counter + 1) / pageSize) + 1;

        const eventsSlug = job.type === 'job' ? 'job_events' : 'events';
        requestGet<ItemsResponse<JobEvent>>(
          `/api/v2/${
            job.type
          }s/${job.id.toString()}/${eventsSlug}/?order_by=counter&page=${page}&page_size=${pageSize}`
        )
          .then((itemsResponse) => {
            setJobEventCount(itemsResponse.count);
            setJobEvents((jobEvents) => {
              jobEvents = { ...jobEvents };
              for (const jobEvent of itemsResponse.results) {
                jobEvents[jobEvent.counter] = jobEvent;
              }
              return jobEvents;
            });
          })
          .catch()
          .finally(() => {
            isQuerying.current.querying = false;
          });
      }
      return jobEvent;
    },
    [job.id, job.type, jobEvents, pageSize]
  );

  return { jobEventCount, getJobOutputEvent, queryJobOutputEvent };
}
