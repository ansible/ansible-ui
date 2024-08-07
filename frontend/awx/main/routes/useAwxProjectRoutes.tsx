import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
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
import { ProjectTeams } from '../../resources/projects/ProjectPage/ProjectTeams';
import { ProjectUsers } from '../../resources/projects/ProjectPage/ProjectUsers';
import { AwxProjectAddUsers } from '../../resources/projects/components/AwxProjectAddUsers';
import { AwxProjectAddTeams } from '../../resources/projects/components/AwxProjectAddTeams';

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
          element: <ScheduleAddWizard resourceEndPoint={awxAPI`/projects/`} />,
        },
        {
          id: AwxRoute.ProjectScheduleEdit,
          path: ':id/schedules/:schedule_id/edit',
          element: <ScheduleEditWizard resourceEndPoint={awxAPI`/projects/`} />,
        },
        {
          id: AwxRoute.ProjectSchedulePage,
          path: ':id/schedules/:schedule_id',
          element: (
            <SchedulePage
              resourceEndPoint={awxAPI`/projects/`}
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
              id: AwxRoute.ProjectJobTemplates,
              path: 'job-templates',
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
              element: (
                <SchedulesList
                  createSchedulePageId={AwxRoute.ProjectScheduleCreate}
                  resourceType="projects"
                  sublistEndpoint={awxAPI`/projects`}
                />
              ),
            },
            {
              id: AwxRoute.ProjectUsers,
              path: 'user-access',
              element: <ProjectUsers />,
            },
            {
              id: AwxRoute.ProjectTeams,
              path: 'team-access',
              element: <ProjectTeams />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
            },
          ],
        },
        {
          id: AwxRoute.ProjectAddUsers,
          path: ':id/user-access/add-users',
          element: <AwxProjectAddUsers />,
        },
        {
          id: AwxRoute.ProjectAddTeams,
          path: ':id/team-access/add-teams',
          element: <AwxProjectAddTeams />,
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
