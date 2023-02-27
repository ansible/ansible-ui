import { useCallback, useEffect, useState } from 'react';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { useAutomationServers } from '../../../automation-servers/contexts/AutomationServerProvider';
import { ItemsResponse, requestGet } from '../../../Data';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useDB } from './indexdb';

export type UnifiedJobSummary = Pick<UnifiedJob, 'id' | 'finished' | 'failed'>;

interface IJobData {
  jobs: { [id: number]: UnifiedJobSummary };
  history: { [date: string]: { success: number; failure: number } };
}

export function JobsChart(props: { height?: number }) {
  const [data, setData] = useState<IJobData>(() => {
    const data: IJobData = {
      jobs: {},
      history: {},
    };
    let now = Date.now();
    for (let i = 0; i <= 31; i++) {
      const date = new Date(now);
      const label = new Date(date.toDateString()).toISOString();
      if (!data.history[label]) data.history[label] = { success: 0, failure: 0 };
      now -= 24 * 60 * 60 * 1000;
    }
    return data;
  });

  const { automationServer } = useAutomationServers();
  const db = useDB(automationServer?.url ?? '');

  const updateJobs = useCallback(
    (jobs: UnifiedJobSummary[], disablePut?: boolean) => {
      setData((data) => {
        for (const job of jobs) {
          if (!disablePut) void db?.put('jobHistory', job);

          const existingJob = data.jobs[job.id];
          if (existingJob) {
            const existingDate = new Date(
              new Date(existingJob.finished).toDateString()
            ).toISOString();
            if (data.history[existingDate]) {
              if (existingJob.failed) {
                data.history[existingDate].failure--;
              } else if (existingJob.finished) {
                data.history[existingDate].success--;
              }
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
    },
    [db]
  );

  useEffect(() => {
    const abortController = new AbortController();

    async function up() {
      if (db === undefined) return;
      const jobs = await db.getAll('jobHistory');
      updateJobs(jobs, true);
      let lastFinished: Date | undefined;
      for (const job of jobs) {
        if ('finished' in job && typeof job.finished === 'string') {
          if (!lastFinished) {
            lastFinished = new Date(job.finished);
          } else {
            const date = new Date(job.finished);
            if (date > lastFinished) lastFinished = date;
          }
        }
      }
      if (!lastFinished) lastFinished = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      queryJobs(updateJobs, lastFinished, abortController);
    }
    void up();
    return () => {
      abortController.abort();
    };
  }, [db, updateJobs]);

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

function queryJobs(
  addJobs: (jobs: UnifiedJobSummary[]) => void,
  lastFinshed: Date,
  abortController: AbortController
) {
  async function update() {
    try {
      let itemsResponse = await requestGet<ItemsResponse<UnifiedJobSummary>>(
        `/api/v2/unified_jobs/` +
          `?not__launch_type=sync` +
          `&finished__gte=${lastFinshed.toISOString()}` +
          `&order_by=finished` +
          `&page_size=200`
      );
      if (!abortController.signal.aborted) {
        addJobs(
          itemsResponse.results.map((result) => ({
            id: result.id,
            finished: result.finished,
            failed: result.failed,
          }))
        );
      }

      while (itemsResponse.next) {
        itemsResponse = await requestGet<ItemsResponse<UnifiedJobSummary>>(
          itemsResponse.next,
          abortController.signal
        );
        if (!abortController.signal.aborted) {
          addJobs(
            itemsResponse.results.map((result) => ({
              id: result.id,
              finished: result.finished,
              failed: result.failed,
            }))
          );
        }
      }
    } catch {
      /* Do nothing */
    }
  }
  void update();
}
