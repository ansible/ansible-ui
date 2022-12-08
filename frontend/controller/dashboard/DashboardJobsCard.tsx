import { CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../framework';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { PageDashboardChart } from '../../../framework/PageDashboard/PageDashboardChart';
import { useJobsView } from '../views/jobs/hooks/useJobsView';

export function DashboardJobsCard() {
  const { t } = useTranslation();
  const jobsView = useJobsView();
  const jobs = jobsView.pageItems;
  const jobHistory = useMemo(() => {
    const success: Record<string, number> = {};
    const failure: Record<string, number> = {};
    const now = DateTime.now();
    const monthAgo = now.minus({ months: 1 });

    for (
      let iterator = now.minus({ months: 1 });
      iterator < now;
      iterator = iterator.plus({ day: 1 })
    ) {
      const label =
        iterator.month.toString().padStart(2, ' ') + '/' + iterator.day.toString().padStart(2, ' ');
      if (!success[label]) success[label] = 0;
      if (!failure[label]) failure[label] = 0;
    }

    for (const job of jobs ?? []) {
      const dateTime = DateTime.fromISO(job.finished);
      if (dateTime < monthAgo) continue;
      const date = DateTime.fromISO(job.finished);
      const label =
        date.month.toString().padStart(2, ' ') + '/' + date.day.toString().padStart(2, ' ');
      if (!success[label]) success[label] = 0;
      if (!failure[label]) failure[label] = 0;
      if (!job.failed) {
        success[label]++;
      } else {
        failure[label]++;
      }
    }
    return {
      successful: Object.keys(success)
        .sort()
        .map((label) => ({
          label: label.replace(' ', '').replace(' ', ''),
          value: success[label],
        })),
      failed: Object.keys(failure)
        .sort()
        .map((label) => ({
          label: label.replace(' ', '').replace(' ', ''),
          value: failure[label],
        })),
    };
  }, [jobs]);
  return (
    <PageDashboardCard>
      <CardHeader>
        <CardTitle>{t('Job Runs')}</CardTitle>
      </CardHeader>
      <CardBody>
        <PageDashboardChart
          groups={[
            { color: pfDanger, values: jobHistory.failed },
            { color: pfSuccess, values: jobHistory.successful },
          ]}
        />
      </CardBody>
    </PageDashboardCard>
  );
}
