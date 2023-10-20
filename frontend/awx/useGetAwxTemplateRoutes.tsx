import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { Navigate } from 'react-router-dom';
import { Schedules } from './views/schedules/Schedules';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { ScheduleRules } from './views/schedules/SchedulePage/ScheduleRules';
import { ScheduleDetails } from './views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { Templates } from './resources/templates/Templates';
import { WorkflowJobTemplateDetails } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { WorkflowJobTemplatePage } from './resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import {
  CreateWorkflowJobTemplate,
  EditWorkflowJobTemplate,
} from './resources/templates/WorkflowJobTemplateForm';
import { TemplateLaunchWizard } from './resources/templates/TemplatePage/TemplateLaunchWizard';
import { TemplateDetails } from './resources/templates/TemplatePage/TemplateDetails';
import { TemplatePage } from './resources/templates/TemplatePage/TemplatePage';
import { CreateJobTemplate, EditJobTemplate } from './resources/templates/TemplateForm';
import { WorkflowVisualizer } from './resources/templates/WorkflowVisualizer/WorkflowVisualizer';

export function useGetAwxTemplateRoutes() {
  const { t } = useTranslation();
  const templateRoutes = useMemo<PageNavigationItem>(
    () => ({
      label: t('Templates'),
      path: 'templates',
      children: [
        {
          path: 'job_template',
          children: [
            {
              id: AwxRoute.CreateJobTemplate,
              path: 'create',
              element: <CreateJobTemplate />,
            },
            {
              id: AwxRoute.EditJobTemplate,
              path: ':id/edit',
              element: <EditJobTemplate />,
            },
            {
              id: AwxRoute.JobTemplateScheduleCreate,
              path: ':id/schedules/create',
              element: <CreateSchedule />,
            },
            {
              id: AwxRoute.JobTemplateEditSchedule,
              path: ':id/schedules/:schedule_id/edit',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.JobTemplateSchedulePage,
              path: ':id/schedules/:schedule_id',
              element: (
                <SchedulePage
                  backTab={{
                    label: t('Back to Templates'),
                    page: AwxRoute.Templates,
                    persistentFilterKey: 'job_template-schedules',
                  }}
                  tabs={[
                    {
                      label: t('Details'),
                      page: AwxRoute.JobTemplateScheduleDetails,
                    },
                    {
                      label: t('Rules'),
                      page: AwxRoute.JobTemplateScheduleRrules,
                    },
                  ]}
                />
              ),
              children: [
                {
                  id: AwxRoute.JobTemplateScheduleDetails,
                  path: 'details',
                  element: <ScheduleDetails />,
                },
                {
                  id: AwxRoute.JobTemplateScheduleRrules,
                  path: 'rrules',
                  element: <ScheduleRules />,
                },
              ],
            },
            {
              id: AwxRoute.JobTemplatePage,
              path: ':id',
              element: <TemplatePage />,
              children: [
                {
                  id: AwxRoute.JobTemplateDetails,
                  path: 'details',
                  element: <TemplateDetails />,
                },
                {
                  id: AwxRoute.JobTemplateAccess,
                  path: 'access',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.JobTemplateJobs,
                  path: 'job',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.JobTemplateNotifications,
                  path: 'notifications',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.JobTemplateSurvey,
                  path: 'survey',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.JobTemplateSchedules,
                  path: 'schedules',
                  element: <Schedules sublistEndpoint={`/api/v2/job_templates`} />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: AwxRoute.TemplateLaunchWizard,
              path: ':id/launch',
              element: <TemplateLaunchWizard />,
            },
          ],
        },
        {
          path: 'workflow_job_template',
          children: [
            {
              id: AwxRoute.CreateWorkflowJobTemplate,
              path: 'create',
              element: <CreateWorkflowJobTemplate />,
            },
            {
              id: AwxRoute.EditWorkflowJobTemplate,
              path: ':id/edit',
              element: <EditWorkflowJobTemplate />,
            },
            {
              id: AwxRoute.WorkflowJobTemplateScheduleCreate,
              path: ':id/schedules/create',
              element: <CreateSchedule />,
            },
            {
              id: AwxRoute.WorkflowJobTemplateEditSchedule,
              path: ':id/schedules/:schedule_id/edit',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.WorkflowJobTemplateSchedulePage,
              path: ':id/schedules/:schedule_id',
              element: (
                <SchedulePage
                  backTab={{
                    label: t('Back to Schedules'),
                    page: AwxRoute.WorkflowJobTemplateSchedules,
                    persistentFilterKey: 'workflow_job_template-schedules',
                  }}
                  tabs={[
                    {
                      label: t('Details'),
                      page: AwxRoute.WorkflowJobTemplateScheduleDetails,
                    },
                    {
                      label: t('Rules'),
                      page: AwxRoute.WorkflowJobTemplateScheduleRrules,
                    },
                  ]}
                />
              ),
              children: [
                {
                  id: AwxRoute.WorkflowJobTemplateScheduleDetails,
                  path: 'details',
                  element: <ScheduleDetails />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateScheduleRrules,
                  path: 'rrules',
                  element: <ScheduleRules />,
                },
              ],
            },
            {
              id: AwxRoute.WorkflowJobTemplatePage,
              path: ':id',
              element: <WorkflowJobTemplatePage />,
              children: [
                {
                  id: AwxRoute.WorkflowJobTemplateDetails,
                  path: 'details',
                  element: <WorkflowJobTemplateDetails />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateAccess,
                  path: 'access',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateJobs,
                  path: 'workflow_jobs',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateSurvey,
                  path: 'survey',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.WorkflowVisualizer,
                  path: 'visualizer',
                  element: <WorkflowVisualizer />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateSchedules,
                  path: 'schedules',
                  element: <Schedules sublistEndpoint={`/api/v2/workflow_job_templates`} />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateNotifications,
                  path: 'notifications',
                  element: <PageNotImplemented />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
          ],
        },
        {
          id: AwxRoute.Templates,
          path: '',
          element: <Templates />,
        },
      ],
    }),
    [t]
  );
  return templateRoutes;
}
