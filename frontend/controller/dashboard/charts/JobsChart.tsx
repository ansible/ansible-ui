import { useCallback, useEffect, useState } from 'react';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { ItemsResponse, requestGet } from '../../../Data';
import { UnifiedJob } from '../../interfaces/UnifiedJob';

function useJobsRange(addJob: (jobs: UnifiedJob[]) => void) {
  useEffect(() => {
    const abortController = new AbortController();
    async function update() {
      try {
        let itemsResponse = await requestGet<ItemsResponse<UnifiedJob>>(
          `/api/v2/unified_jobs/` +
            `?not__launch_type=sync` +
            `&order_by=-finished` +
            `&page_size=200`
        );
        if (!abortController.signal.aborted) {
          addJob(itemsResponse.results);
        }

        while (itemsResponse.next) {
          itemsResponse = await requestGet<ItemsResponse<UnifiedJob>>(
            itemsResponse.next,
            abortController.signal
          );
          if (!abortController.signal.aborted) {
            addJob(itemsResponse.results);
          }

          if (!itemsResponse.results.length) break;
          const lastCreated = new Date(
            itemsResponse.results[itemsResponse.results.length - 1].created
          );
          if (lastCreated.valueOf() < Date.now() - 31 * 24 * 60 * 60 * 1000) break;
        }
      } catch {
        /* Do nothing */
      }
    }
    void update();
    return () => abortController.abort('component unmounted');
  }, [addJob]);
}

export function JobsChart(props: { height?: number }) {
  const [data, setData] = useState<{
    jobs: { [id: number]: UnifiedJob };
    history: { [date: string]: { success: number; failure: number } };
  }>({
    jobs: {},
    history: {},
  });

  useEffect(() => {
    setData((data) => {
      let now = Date.now();
      for (let i = 0; i <= 31; i++) {
        const date = new Date(now);
        const label = new Date(date.toDateString()).toISOString();
        if (!data.history[label]) data.history[label] = { success: 0, failure: 0 };
        now -= 24 * 60 * 60 * 1000;
      }
      return { ...data };
    });
  }, []);

  const updateJobs = useCallback((jobs: UnifiedJob[]) => {
    setData((data) => {
      for (const job of jobs) {
        const existingJob = data.jobs[job.id];
        if (existingJob) {
          const existingDate = new Date(existingJob.finished).toLocaleDateString();
          if (!data.history[existingDate]) data.history[existingDate] = { success: 0, failure: 0 };
          if (existingJob.failed) {
            data.history[existingDate].failure--;
          } else if (existingJob.finished) {
            data.history[existingDate].success--;
          }
        }

        if (new Date(job.finished).valueOf() < Date.now() - 31 * 24 * 60 * 60 * 1000) continue;
        data.jobs[job.id] = job;
        const label = new Date(new Date(job.finished).toDateString()).toISOString();
        if (!data.history[label]) data.history[label] = { success: 0, failure: 0 };
        if (job.failed) {
          data.history[label].failure++;
        } else if (job.finished) {
          data.history[label].success++;
        }
      }

      return { ...data };
    });
  }, []);

  useJobsRange(updateJobs);

  const failedHistory = Object.keys(data.history)
    .sort()
    .map((label) => ({ label, value: data.history[label].failure }));

  const successHistory = Object.keys(data.history)
    .sort()
    .map((label) => ({ label, value: data.history[label].success }));

  return (
    <div style={{ height: props.height ?? '100%' }}>
      <PageDashboardChart
        groups={[
          { color: pfDanger, values: failedHistory },
          { color: pfSuccess, values: successHistory },
        ]}
      />
    </div>
  );
}
