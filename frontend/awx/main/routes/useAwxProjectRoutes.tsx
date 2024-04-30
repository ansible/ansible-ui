import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { awxAPI } from '../../common/api/awx-utils';
import { ProjectDetails } from '../../resources/projects/ProjectPage/ProjectDetails';
import { CreateProject, EditProject } from '../../resources/projects/ProjectPage/ProjectForm';
import { ProjectJobTemplates } from '../../resources/projects/ProjectPage/ProjectJobTemplates';
import { ProjectPage } from '../../resources/projects/ProjectPage/ProjectPage';
import { Projects } from '../../resources/projects/Projects';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../views/schedules/SchedulePage/SchedulePage';
import { AwxRoute } from '../AwxRoutes';
import { ResourceNotifications } from '../../resources/notifications/ResourceNotifications';
import { SchedulesList } from '../../views/schedules/SchedulesList';
import { ScheduleEditWizard } from '../../views/schedules/wizard/ScheduleEditWizard';

export function useAwxProjectRoutes() {
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
          element: <ScheduleAddWizard />,
        },
        {
          id: AwxRoute.ProjectScheduleEdit,
          path: ':id/schedules/:schedule_id/edit',
          element: <ScheduleEditWizard />,
        },
        {
          id: AwxRoute.ProjectSchedulePage,
          path: ':id/schedules/:schedule_id',
          element: (
            <SchedulePage
              initialBreadCrumbs={[
                { label: t('Projects'), to: AwxRoute.Projects },
                { id: 'data', to: AwxRoute.ProjectPage },
                { label: t('Schedules'), id: 'schedules', to: AwxRoute.ProjectSchedules },
              ]}
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
              ]}
            />
          ),
          children: [
            {
              id: AwxRoute.ProjectScheduleDetails,
              path: 'details',
              element: <ScheduleDetails />,
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
              element: <ProjectJobTemplates />,
            },
            {
              id: AwxRoute.ProjectNotifications,
              path: 'notifications',
              element: <ResourceNotifications resourceType="projects" />,
            },
            {
              id: AwxRoute.ProjectSchedules,
              path: 'schedules',
              element: <SchedulesList sublistEndpoint={awxAPI`/projects`} />,
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
