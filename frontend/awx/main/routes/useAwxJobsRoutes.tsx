import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { JobDetails } from '../../views/jobs/JobDetails';
import { JobOutput } from '../../views/jobs/JobOutput/JobOutput';
import { JobPage } from '../../views/jobs/JobPage';
import { Jobs } from '../../views/jobs/Jobs';
import { AwxRoute } from '../AwxRoutes';

export function useAwxJobsRoutes() {
  const { t } = useTranslation();
  const jobRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Jobs,
      label: t('Jobs'),
      path: 'jobs',
      children: [
        {
          id: AwxRoute.JobPage,
          path: ':job_type/:id',
          element: <JobPage />,
          children: [
            {
              id: AwxRoute.JobOutput,
              path: 'output',
              element: <JobOutput />,
            },
            {
              id: AwxRoute.JobDetails,
              path: 'details',
              element: <JobDetails />,
            },
          ],
        },
        {
          path: '',
          element: <Jobs />,
        },
      ],
    }),
    [t]
  );
  return jobRoutes;
}
