import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateJobTemplate, EditJobTemplate } from '../../resources/templates/TemplateForm';
import { TemplateDetails } from '../../resources/templates/TemplatePage/TemplateDetails';
import { TemplateLaunchWizard } from '../../resources/templates/TemplatePage/TemplateLaunchWizard';
import { TemplatePage } from '../../resources/templates/TemplatePage/TemplatePage';
import { Templates } from '../../resources/templates/Templates';
import {
  CreateWorkflowJobTemplate,
  EditWorkflowJobTemplate,
} from '../../resources/templates/WorkflowJobTemplateForm';
import { WorkflowJobTemplateDetails } from '../../resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { WorkflowJobTemplatePage } from '../../resources/templates/WorkflowJobTemplatePage/WorkflowJobTemplatePage';
import { WorkflowVisualizer } from '../../resources/templates/WorkflowVisualizer/WorkflowVisualizer';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../views/schedules/SchedulePage/SchedulePage';
import { AwxRoute } from '../AwxRoutes';
import { ResourceNotifications } from '../../resources/notifications/ResourceNotifications';
import { TemplateJobs } from '../../resources/templates/TemplatePage/TemplateJobs';
import { TemplateSurvey } from '../../resources/templates/TemplatePage/TemplateSurvey';
import { SchedulesList } from '../../views/schedules/SchedulesList';
import { ScheduleEditWizard } from '../../views/schedules/wizard/ScheduleEditWizard';
import {
  EditTemplateSurveyForm,
  AddTemplateSurveyForm,
} from '../../resources/templates/TemplatePage/TemplateSurveyForm';

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
              element: <ScheduleAddWizard />,
            },
            {
              id: AwxRoute.JobTemplateScheduleEdit,
              path: ':id/schedules/:schedule_id/edit',
              element: <ScheduleEditWizard />,
            },
            {
              id: AwxRoute.JobTemplateSchedulePage,
              path: ':id/schedules/:schedule_id',
              element: (
                <SchedulePage
                  initialBreadCrumbs={[
                    { label: t('Templates'), to: AwxRoute.Templates },
                    { id: 'data', to: AwxRoute.JobTemplatePage },
                    { label: t('Schedules'), id: 'schedules', to: AwxRoute.JobTemplateSchedules },
                  ]}
                  backTab={{
                    label: t('Back to Schedules'),
                    page: AwxRoute.JobTemplateSchedules,
                    persistentFilterKey: 'job_template-schedules',
                  }}
                  tabs={[
                    {
                      label: t('Details'),
                      page: AwxRoute.JobTemplateScheduleDetails,
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
                  element: <TemplateJobs resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.JobTemplateNotifications,
                  path: 'notifications',
                  element: <ResourceNotifications resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.JobTemplateSurvey,
                  path: 'survey',
                  element: <TemplateSurvey resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.AddJobTemplateSurvey,
                  path: 'survey/add',
                  element: <AddTemplateSurveyForm resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.EditJobTemplateSurvey,
                  path: 'survey/edit',
                  element: <EditTemplateSurveyForm resourceType="job_templates" />,
                },
                {
                  id: AwxRoute.JobTemplateSchedules,
                  path: 'schedules',
                  element: <SchedulesList sublistEndpoint={awxAPI`/job_templates`} />,
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
              element: <TemplateLaunchWizard jobType="job_templates" />,
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
              element: <ScheduleAddWizard />,
            },
            {
              id: AwxRoute.WorkflowJobTemplateScheduleEdit,
              path: ':id/schedules/:schedule_id/edit',
              element: <ScheduleEditWizard />,
            },
            {
              id: AwxRoute.WorkflowJobTemplateSchedulePage,
              path: ':id/schedules/:schedule_id',
              element: (
                <SchedulePage
                  initialBreadCrumbs={[
                    { label: t('Templates'), to: AwxRoute.Templates },
                    { id: 'data', to: AwxRoute.WorkflowJobTemplatePage },
                    {
                      label: t('Schedules'),
                      id: 'schedules',
                      to: AwxRoute.WorkflowJobTemplateSchedules,
                    },
                  ]}
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
                  ]}
                />
              ),
              children: [
                {
                  id: AwxRoute.WorkflowJobTemplateScheduleDetails,
                  path: 'details',
                  element: <ScheduleDetails />,
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
                  element: <TemplateJobs resourceType="workflow_job_templates" />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateSurvey,
                  path: 'survey',
                  element: <TemplateSurvey resourceType="workflow_job_templates" />,
                },
                {
                  id: AwxRoute.AddWorkflowJobTemplateSurvey,
                  path: 'survey/add',
                  element: <AddTemplateSurveyForm resourceType="workflow_job_templates" />,
                },
                {
                  id: AwxRoute.EditWorkflowJobTemplateSurvey,
                  path: 'survey/edit',
                  element: <EditTemplateSurveyForm resourceType="workflow_job_templates" />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateSchedules,
                  path: 'schedules',
                  element: <SchedulesList sublistEndpoint={awxAPI`/workflow_job_templates`} />,
                },
                {
                  id: AwxRoute.WorkflowJobTemplateNotifications,
                  path: 'notifications',
                  element: <ResourceNotifications resourceType="workflow_job_templates" />,
                },
                {
                  path: '',
                  element: <Navigate to="details" />,
                },
              ],
            },
            {
              id: AwxRoute.WorkflowJobTemplateLaunchWizard,
              path: ':id/launch',
              element: <TemplateLaunchWizard jobType="workflow_job_templates" />,
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
