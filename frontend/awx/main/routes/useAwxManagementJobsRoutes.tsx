import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { ManagementJobPage } from '../../administration/management-jobs/ManagementJobPage/ManagementJobPage';
import { ManagementJobs } from '../../administration/management-jobs/ManagementJobsList';
import { AwxRoute } from '../AwxRoutes';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { ScheduleEditWizard } from '../../views/schedules/wizard/ScheduleEditWizard';
import { SchedulesList } from '../../views/schedules/SchedulesList';
import { awxAPI } from '../../common/api/awx-utils';
import { SchedulePage } from '../../views/schedules/SchedulePage/SchedulePage';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';

export function useAwxManagementJobsRoutes() {
  const { t } = useTranslation();
  const managementJobsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.ManagementJobs,
      label: t('Management Jobs'),
      path: 'management-jobs',
      children: [
        {
          id: AwxRoute.ManagementJobSchedulePage,
          path: ':id/schedules/:schedule_id/',
          element: (
            <SchedulePage
              initialBreadCrumbs={[
                { label: t('Management Jobs'), to: AwxRoute.ManagementJobs },
                { id: 'data', to: AwxRoute.ManagementJobPage },
                { label: t('Schedules'), id: 'schedules', to: AwxRoute.ManagementJobSchedules },
              ]}
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
              ]}
            />
          ),
          children: [
            {
              id: AwxRoute.ManagementJobScheduleDetails,
              path: 'details',
              element: <ScheduleDetails />,
            },
          ],
        },
        {
          id: AwxRoute.ManagementJobScheduleEdit,
          path: ':id/schedules/:schedule_id/edit',
          element: <ScheduleEditWizard />,
        },
        {
          id: AwxRoute.ManagementJobScheduleCreate,
          path: ':id/schedules/create',
          element: <ScheduleAddWizard />,
        },
        {
          id: AwxRoute.ManagementJobPage,
          path: ':id',
          element: <ManagementJobPage />,
          children: [
            { id: AwxRoute.ManagementJobDetails, path: 'details', element: <PageNotImplemented /> },
            {
              id: AwxRoute.ManagementJobSchedules,
              path: 'schedules',
              element: <SchedulesList sublistEndpoint={awxAPI`/system_job_templates`} />,
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
