import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { schedulePageUrl } from '../types';

export function useGetScheduleUrl() {
  const { t } = useTranslation();
  return useCallback(
    (route: string, schedule: Schedule) => {
      const unified_job_type = schedule.summary_fields.unified_job_template.unified_job_type;
      let params: { id: string; schedule_id: string; source_id?: string; inventory_type?: string } =
        {
          id: schedule.summary_fields.unified_job_template?.id.toString(),
          schedule_id: schedule.id.toString(),
        };
      if (unified_job_type === 'inventory_update' && schedule.summary_fields.inventory?.id) {
        params = {
          id: schedule.summary_fields.inventory?.id.toString(),
          source_id: schedule.summary_fields.unified_job_template.id.toString(),
          schedule_id: schedule.id.toString(),
          inventory_type: 'inventory',
        };
        return {
          name: t('Inventory sync'),
          details: {
            pageId: AwxRoute.InventorySourceScheduleDetails,
            params,
          },
          create: {
            pageId: AwxRoute.InventorySourceScheduleCreate,
            params,
          },
          edit: {
            pageId: AwxRoute.InventorySourceScheduleEdit,
            params,
          },
          resource: {
            pageId: AwxRoute.InventorySourceDetail,
            params,
          },
          scheduleList: { pageId: AwxRoute.InventorySourceSchedules, params },
        }[route] as string | schedulePageUrl;
      }
      if (unified_job_type === 'job') {
        return {
          name: t('Playbook run'),
          details: { pageId: AwxRoute.JobTemplateScheduleDetails, params },
          create: { pageId: AwxRoute.JobTemplateScheduleCreate, params },
          edit: { pageId: AwxRoute.JobTemplateScheduleEdit, params },
          resource: { pageId: AwxRoute.JobTemplateDetails, params },
          scheduleList: { pageId: AwxRoute.JobTemplateSchedules, params },
        }[route] as string | schedulePageUrl;
      }
      if (unified_job_type === 'project_update') {
        return {
          name: t('Project update'),
          details: { pageId: AwxRoute.ProjectScheduleDetails, params },
          create: { pageId: AwxRoute.ProjectScheduleCreate, params },
          edit: { pageId: AwxRoute.ProjectScheduleEdit, params },
          resource: { pageId: AwxRoute.ProjectDetails, params },
          scheduleList: { pageId: AwxRoute.ProjectSchedules, params },
        }[route] as string | schedulePageUrl;
      }
      if (unified_job_type === 'system_job') {
        return {
          name: t('Management job'),
          details: { pageId: AwxRoute.ManagementJobScheduleDetails, params },
          create: { pageId: AwxRoute.ManagementJobScheduleCreate, params },
          edit: { pageId: AwxRoute.ManagementJobScheduleEdit, params },
          resource: { pageId: AwxRoute.ManagementJobSchedules, params },
          scheduleList: { pageId: AwxRoute.ManagementJobSchedules, params },
        }[route] as string | schedulePageUrl;
      }
      if (unified_job_type === 'workflow_job') {
        return {
          name: t('Workflow job'),
          details: { pageId: AwxRoute.WorkflowJobTemplateScheduleDetails, params },
          create: { pageId: AwxRoute.WorkflowJobTemplateScheduleCreate, params },
          edit: { pageId: AwxRoute.WorkflowJobTemplateScheduleEdit, params },
          resource: { pageId: AwxRoute.WorkflowJobTemplateDetails, params },
          scheduleList: { pageId: AwxRoute.WorkflowJobTemplateSchedules, params },
        }[route] as string | schedulePageUrl;
      }
      return '';
    },
    [t]
  );
}
