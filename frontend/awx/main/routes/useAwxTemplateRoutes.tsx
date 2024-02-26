import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { ResourceNotifications } from '../../administration/job-notifications/notifications/ResourceNotifications';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateSchedule } from '../../schedules/ScheduleForm';
import { ScheduleDetails } from '../../schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../schedules/SchedulePage/SchedulePage';
import { ScheduleRules } from '../../schedules/SchedulePage/ScheduleRules';
import { Schedules } from '../../schedules/Schedules';
import { CreateJobTemplate, EditJobTemplate } from '../../templates/TemplateForm';
import { TemplateDetails } from '../../templates/TemplatePage/TemplateDetails';
import { TemplateLaunchWizard } from '../../templates/TemplatePage/TemplateLaunchWizard';
import { TemplatePage } from '../../templates/TemplatePage/TemplatePage';
import { Templates } from '../../templates/Templates';
import {
  CreateWorkflowJobTemplate,
  EditWorkflowJobTemplate,
} from '../../templates/WorkflowJobTemplateForm';
import { WorkflowJobTemplateDetails } from '../../templates/WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { WorkflowJobTemplatePage } from '../../templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import { WorkflowVisualizer } from '../../templates/WorkflowVisualizer/WorkflowVisualizer';
import { AwxRoute } from '../AwxRoutes';

export function useAwxTemplateRoutes() {
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
                      page: AwxRoute.JobTemplateScheduleRules,
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
                  id: AwxRoute.JobTemplateScheduleRules,
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
                  element: <ResourceNotifications resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.JobTemplateSurvey,
                  path: 'survey',
                  element: <PageNotImplemented />,
                },
                {
                  id: AwxRoute.JobTemplateSchedules,
                  path: 'schedules',
                  element: <Schedules sublistEndpoint={awxAPI`/job_templates`} />,
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
                      page: AwxRoute.WorkflowJobTemplateScheduleRules,
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
                  id: AwxRoute.WorkflowJobTemplateScheduleRules,
                  path: 'rrules',
                  element: <ScheduleRules />,
                },
              ],
            },
            {
              id: AwxRoute.WorkflowVisualizer,
              path: ':id/visualizer',
              element: <WorkflowVisualizer />,
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
                  id: AwxRoute.WorkflowJobTemplateSchedules,
                  path: 'schedules',
                  element: <Schedules sublistEndpoint={awxAPI`/workflow_job_templates`} />,
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
