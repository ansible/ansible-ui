import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { Projects } from './resources/projects/Projects';
import { Navigate } from 'react-router-dom';
import { Schedules } from './views/schedules/Schedules';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { ProjectPage } from './resources/projects/ProjectPage/ProjectPage';
import { ProjectDetails } from './resources/projects/ProjectPage/ProjectDetails';
import { ScheduleRules } from './views/schedules/SchedulePage/ScheduleRules';
import { ScheduleDetails } from './views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { CreateProject, EditProject } from './resources/projects/ProjectPage/ProjectForm';

export function useGetAwxProjectRoutes() {
  const { t } = useTranslation();
  const projectRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Projects,
      label: t('Projects'),
      path: 'projects',
      children: [
        {
          id: AwxRoute.CreateProject,
          path: 'create',
          element: <CreateProject />,
        },
        {
          id: AwxRoute.EditProject,
          path: ':id/edit',
          element: <EditProject />,
        },
        {
          id: AwxRoute.ProjectScheduleCreate,
          path: ':id/schedules/create',
          element: <CreateSchedule />,
        },
        {
          id: AwxRoute.ProjectScheduleEdit,
          path: ':id/schedules/:schedule_id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.ProjectSchedulePage,
          path: ':id/schedules/:schedule_id',
          element: (
            <SchedulePage
              backTab={{
                label: t('Back to Schedules'),
                page: AwxRoute.ProjectSchedules,
                persistentFilterKey: 'project-schedules',
              }}
              tabs={[
                {
                  label: t('Details'),
                  page: AwxRoute.ProjectScheduleDetails,
                },
                {
                  label: t('Rules'),
                  page: AwxRoute.ProjectScheduleRrules,
                },
              ]}
            />
          ),
          children: [
            {
              id: AwxRoute.ProjectScheduleDetails,
              path: 'details',
              element: <ScheduleDetails />,
            },
            {
              id: AwxRoute.ProjectScheduleRrules,
              path: 'rrules',
              element: <ScheduleRules />,
            },
          ],
        },

        {
          id: AwxRoute.ProjectPage,
          path: ':id',
          element: <ProjectPage />,
          children: [
            { id: AwxRoute.ProjectDetails, path: 'details', element: <ProjectDetails /> },
            {
              id: AwxRoute.ProjectAccess,
              path: 'access',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.ProjectJobTemplates,
              path: 'job_templates',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.ProjectNotifications,
              path: 'notifications',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.ProjectSurvey,
              path: 'survey',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.ProjectSchedules,
              path: 'schedules',
              element: <Schedules sublistEndpoint={`/api/v2/projects`} />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <Projects />,
        },
      ],
    }),
    [t]
  );
  return projectRoutes;
}
