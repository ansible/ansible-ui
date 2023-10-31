import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PageNotImplemented } from '../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from './AwxRoutes';
import { ManagementJobPage } from './administration/management-jobs/ManagementJobPage/ManagementJobPage';
import { ManagementJobs } from './administration/management-jobs/ManagementJobs';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { Schedules } from './views/schedules/Schedules';

export function useGetAwxManagementJobsRoutes() {
  const { t } = useTranslation();
  const managementJobsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ManagementJobs,
      label: t('Management Jobs'),
      path: 'management-jobs',
      children: [
        {
          id: AwxRoute.ManagementJobSchedulePage,
          path: ':id/schedules/:schedule_id',
          element: (
            <SchedulePage
              backTab={{
                label: t('Back to Schedules'),
                page: AwxRoute.ManagementJobSchedules,
                persistentFilterKey: 'management-jobs-schedules',
              }}
              tabs={[
                {
                  label: t('Details'),
                  page: AwxRoute.ManagementJobScheduleDetails,
                },
                {
                  label: t('Rules'),
                  page: AwxRoute.ManagementJobScheduleRrules,
                },
              ]}
            />
          ),
        },
        {
          id: AwxRoute.ManagementJobEditSchedule,
          path: ':id/schedules/:schedule_id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.ManagementJobPage,
          path: ':id',
          element: <ManagementJobPage />,
          children: [
            {
              id: AwxRoute.ManagementJobSchedules,
              path: 'schedules',
              element: <Schedules sublistEndpoint={`/api/v2/system_job_templates`} />,
            },
            {
              id: AwxRoute.ManagementJobNotifications,
              path: 'notifications',
              element: <PageNotImplemented />,
            },
            {
              path: '',
              element: <Navigate to="schedules" />,
            },
          ],
        },
        {
          path: '',
          element: <ManagementJobs />,
        },
      ],
    }),
    [t]
  );
  return managementJobsRoutes;
}
