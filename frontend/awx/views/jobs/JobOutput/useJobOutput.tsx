import {
  DateRangeFilterPresets,
  ToolbarFilterType,
  type IFilterState,
  type IToolbarFilter,
} from '@ansible/ansible-ui-framework';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { Job } from '../../../interfaces/Job';
import { JobEvent } from '../../../interfaces/JobEvent';

type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
  unified_job_id?: number;
};

const WS_EVENTS_BATCH_SIZE = 15;
const runningJobTypes: string[] = ['new', 'pending', 'waiting', 'running'];

export function useJobOutput(
  job: Job,
  reloadJob: () => void,
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  pageSize: number
) {
  const isQuerying = useRef({ querying: false });
  const missingEvents = useRef({} as { [key: number]: boolean });
  const queryTimeout = useRef(undefined as ReturnType<typeof setTimeout> | undefined);
  const [jobEventCount, setJobEventCount] = useState(1);
  const [jobEvents, setJobEvents] = useState<Record<number, JobEvent>>({});

  useEffect(() => {
    const eventsSlug = job.type === 'job' ? 'job_events' : 'events';

    requestGet<AwxItemsResponse<JobEvent>>(
      awxAPI`/${job.type}s/${job.id.toString()}/${eventsSlug}/?order_by=-counter&page_size=1`
    )
      .then((itemsResponse) => {
        setJobEventCount(itemsResponse.results[0].counter);
      })
      .catch(() => {});
  }, [job.id, job.type]);

  const getJobOutputEvent = useCallback(
    (counter: number) => {
      return jobEvents[counter];
    },
    [jobEvents]
  );

  const isFiltered = Object.keys(filterState).length > 0;
  const isJobRunning = !job.status || runningJobTypes.includes(job.status);

  const fetchEvents = useCallback(
    (qsParts: string[]) => {
      const eventsSlug = job.type === 'job' ? 'job_events' : 'events';
      isQuerying.current.querying = true;

      void requestGet<AwxItemsResponse<JobEvent>>(
        awxAPI`/${job.type}s/${job.id.toString()}/${eventsSlug}/`.concat(`?${qsParts.join('&')}`)
      )
        .then((itemsResponse) => {
          if (!isJobRunning) {
            setJobEventCount(itemsResponse.count);
          }
          setJobEvents((jobEvents) => {
            jobEvents = { ...jobEvents };
            let i = Object.keys(jobEvents).length + 1;
            for (const jobEvent of itemsResponse.results) {
              if (isFiltered) {
                jobEvents[i] = jobEvent;
                i++;
              } else {
                jobEvents[jobEvent.counter] = jobEvent;
              }
            }
            return jobEvents;
          });
        })
        .catch()
        .finally(() => {
          isQuerying.current.querying = false;
        });
    },
    [job.id, job.type, isJobRunning, isFiltered]
  );

  const queryJobOutputEvent = useCallback(
    (counter: number) => {
      const jobEvent = jobEvents[counter];
      if (jobEvent || isQuerying.current.querying) {
        return jobEvent;
      }
      if (isJobRunning) {
        missingEvents.current[counter] = true;
        if (!queryTimeout.current) {
          queryTimeout.current = setTimeout(() => {
            const eventCounters = Object.keys(missingEvents.current).filter((counter) => {
              return !jobEvents[Number(counter)];
            });
            if (eventCounters.length > 0) {
              let minCounter = Math.min(...eventCounters.map(Number));
              const maxCounter = Math.max(...eventCounters.map(Number));

              const bigGapIndexes = [];

              // account for big gaps in missing events, usually caused by fast scrolling
              // do not want to fetch all events in between large gaps
              for (let i = 0; i < eventCounters.length; i++) {
                const currentCounter = Number(eventCounters[i]);
                const nextCounter = Number(eventCounters[i + 1]);
                if (nextCounter - currentCounter > 200) {
                  bigGapIndexes.push(i);
                }
              }

              for (const gapIndex of bigGapIndexes) {
                const currentCounter = Number(eventCounters[gapIndex]);
                paginateFetch(currentCounter, minCounter, pageSize, fetchEvents);
                minCounter = Number(eventCounters[gapIndex + 1]);
              }

              paginateFetch(maxCounter, minCounter, pageSize, fetchEvents);
            }
            missingEvents.current = {};
            queryTimeout.current = undefined;
          }, 100);
        }
        return jobEvent;
      }

      const page = Math.floor((counter + 1) / pageSize) + 1;
      const filterString = getFiltersQueryString(toolbarFilters, filterState);
      const qsParts = ['order_by=counter', `page=${page}`, `page_size=${pageSize}`];
      if (filterString) {
        qsParts.push(filterString);
      }
      fetchEvents(qsParts);
      return jobEvent;
    },
    [jobEvents, pageSize, filterState, toolbarFilters, isJobRunning, fetchEvents]
  );

  const batchedEvents = useRef([] as JobEvent[]);
  const batchTimeout = useRef(undefined as ReturnType<typeof setTimeout> | undefined);
  const addBatchedEvents = useCallback(() => {
    if (isFiltered) {
      return;
    }
    const maxCounter = batchedEvents.current.reduce(
      (max, event) => Math.max(max, event.counter),
      jobEventCount
    );
    setJobEvents((jobEvents) => {
      jobEvents = { ...jobEvents };
      batchedEvents.current.forEach((message: JobEvent) => {
        jobEvents[message.counter] = message;
      });
      batchedEvents.current = [];
      return jobEvents;
    });
    setJobEventCount(maxCounter);
  }, [isFiltered, jobEventCount]);

  const eventGroup = `${job.type}_events`;
  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      if (message?.group_name === eventGroup) {
        const jobEvent = message as JobEvent;
        batchedEvents.current.push(jobEvent);
        clearTimeout(batchTimeout.current);
        if (batchedEvents.current.length >= WS_EVENTS_BATCH_SIZE) {
          addBatchedEvents();
        } else {
          batchTimeout.current = setTimeout(addBatchedEvents, 500);
        }
      }
      if (message?.group_name === 'jobs' && message?.unified_job_id === job.id && message?.status) {
        reloadJob();
      }
    },
    [addBatchedEvents, eventGroup, reloadJob, job.id]
  );

  const fallback = useCallback(() => {
    const timeout = setInterval(() => {
      const eventsSlug = job.type === 'job' ? 'job_events' : 'events';
      requestGet<AwxItemsResponse<JobEvent>>(
        awxAPI`/${job.type}s/${job.id.toString()}/${eventsSlug}/?order_by=-counter&page_size=1`
      )
        .then((itemsResponse: AwxItemsResponse<JobEvent>) => {
          setJobEventCount(itemsResponse.results[0].counter);
        })
        .catch(() => {});
    }, 5000);
    return () => {
      clearInterval(timeout);
    };
  }, [job.id, job.type]);

  useAwxWebSocketSubscription(
    {
      control: ['limit_reached_1'],
      jobs: ['summary', 'status_changed'],
      [eventGroup]: [job.id],
    },
    handleWebSocketMessage as (message: unknown) => void,
    // fallback handler in case webscoket fails
    isJobRunning ? fallback : undefined
  );

  useEffect(() => {
    setJobEventCount(1);
    setJobEvents({});
  }, [filterState]);

  return { jobEventCount, getJobOutputEvent, queryJobOutputEvent, jobEvents };
}

export function getFiltersQueryString(toolbarFilters: IToolbarFilter[], filterState: IFilterState) {
  if (!filterState) {
    return '';
  }
  const parts = [];
  for (const key in filterState) {
    const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
    if (toolbarFilter) {
      const values = filterState[key];
      if (values && values.length > 0) {
        if (values.length > 1) {
          parts.push(values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&'));
        } else {
          const [queryParamName, queryParamValue] = getQueryParamsForDateRangeFilters(
            toolbarFilter,
            values[0]
          );
          parts.push(`${queryParamName}=${queryParamValue}`);
        }
      }
    }
  }
  return parts.join('&');
}

function getQueryParamsForDateRangeFilters(toolbarFilter: IToolbarFilter, value: string) {
  let queryParamName = toolbarFilter.query;
  let queryParamValue = value;
  // Update query params to handle date range filters
  if (toolbarFilter.type === ToolbarFilterType.DateRange) {
    queryParamName = `${toolbarFilter.query}__gte`;
    const date = new Date(Date.now());
    date.setSeconds(0);
    date.setMilliseconds(0);
    switch (value as DateRangeFilterPresets) {
      case DateRangeFilterPresets.LastHour:
        queryParamValue = new Date(date.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case DateRangeFilterPresets.Last24Hours:
        queryParamValue = new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case DateRangeFilterPresets.LastWeek:
        queryParamValue = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case DateRangeFilterPresets.LastMonth:
        queryParamValue = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }
  }
  return [queryParamName, queryParamValue];
}

function paginateFetch(
  maxCounter: number,
  minCounter: number,
  pageSize: number,
  fetchEvents: (qsParts: string[]) => void
) {
  const pages = Math.ceil((maxCounter - minCounter + 1) / pageSize);

  for (let i = 0; i < pages; i++) {
    const qsParts = [
      'order_by=counter',
      `counter__gte=${minCounter}`,
      `counter__lte=${maxCounter}`,
      `page_size=${pageSize}`,
      `page=${i + 1}`,
    ];
    fetchEvents(qsParts);
  }
}
