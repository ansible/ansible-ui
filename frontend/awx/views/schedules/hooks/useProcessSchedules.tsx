import { useCallback } from 'react';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useProcessCredentials } from './useProcessCredentials';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';
import { useProcessLabels } from './useProcessLabels';
import { StandardizedFormData } from '../wizard/ScheduleAddWizard';
import { stringifyTags } from '../../../resources/templates/JobTemplateFormHelpers';

export type CreateSchedulePayload = {
  name: string;
  description?: string;
  timezone: string;
  rrule: string;
  inventory?: number;
  extra_data?: object;
  scm_branch?: string;
  job_type?: string;
  job_tags?: string;
  skip_tags?: string;
  limit?: string;
  diff_mode?: boolean;
  verbosity?: number;
  execution_environment?: number | null;
  organization?: number | null;
  forks?: number;
  job_slice_count?: number;
  timeout?: number;
  credentials?:
    | Credential[]
    | {
        id: number;
        name: string;
        credential_type: number;
        passwords_needed?: string[];
        vault_id?: string;
      }[];
  labels?: { name: string; id: number }[];
  instance_groups?: { id: number; name: string }[];
};

export const useProcessSchedule = () => {
  const postSchedule = usePostRequest<CreateSchedulePayload, Schedule>();
  const postAccessories = usePostAccessories();
  return useCallback(
    async (payloadData: StandardizedFormData) => {
      const { node_resource, prompt, ...rest } = payloadData;
      const {
        execution_environment,
        credentials,
        job_tags,
        skip_tags,
        inventory,
        ...restOfPrompt
      } = prompt || { execution_environment: null, job_tags: '', skip_tags: '' };
      const { type, id } = node_resource;

      let schedule: Schedule;
      let navigationId: string;
      const hasJobTags = job_tags && job_tags?.length > 0;
      const hasSkipTags = prompt && prompt?.skip_tags && prompt?.skip_tags?.length > 0;
      const payload = {
        ...rest,
        ...restOfPrompt,
        inventory: inventory?.id,
        execution_environment: execution_environment?.id,
        skip_tags: hasSkipTags ? stringifyTags(prompt?.skip_tags) : undefined,
        job_tags: hasJobTags ? stringifyTags(job_tags) : undefined,
        enabled: true,
      };
      switch (type) {
        case 'inventory_source':
          return {
            schedule: await postSchedule(
              awxAPI`/inventory_sources/${id.toString()}/schedules/`,
              payload
            ),
            navigationId: AwxRoute.InventorySourceScheduleDetails,
            params: {
              id: node_resource.inventory.toString(),
              inventory_type: 'inventory',
              source_id: id.toString(),
            },
          };
        case 'project':
          return {
            schedule: await postSchedule(awxAPI`/projects/${id.toString()}/schedules/`, payload),
            navigationId: AwxRoute.ProjectScheduleDetails,
            params: { id: id.toString() },
          };
        case 'system_job_template':
          return {
            schedule: await postSchedule(
              awxAPI`/system_job_templates/${id.toString()}/schedules/`,
              payload
            ),
            navigationId: AwxRoute.ManagementJobScheduleDetails,
            params: {
              id: id.toString(),
            },
          };
        case 'workflow_job_template':
          navigationId = AwxRoute.WorkflowJobTemplateScheduleDetails;
          schedule = await postSchedule(
            awxAPI`/workflow_job_templates/${id.toString()}/schedules/`,
            payload
          );
          await postAccessories(schedule, payload);
          return {
            schedule,
            navigationId,
            params: {
              id: id.toString(),
            },
          };
        default:
          navigationId = AwxRoute.JobTemplateScheduleDetails;
          schedule = await postSchedule(
            awxAPI`/job_templates/${id.toString()}/schedules/`,
            payload
          );
          await postAccessories(schedule, payload);

          return {
            schedule,
            navigationId,
            params: {
              id: id.toString(),
            },
          };
      }
    },
    [postSchedule, postAccessories]
  );
};

export function usePostAccessories() {
  const processCredentials = useProcessCredentials();
  const processInstanceGroups = useProcessInstanceGroups();
  const processLabels = useProcessLabels();
  return useCallback(
    async (
      schedule: Schedule,
      payload: Pick<StandardizedFormData, 'launch_config'> &
        Partial<
          Pick<
            StandardizedFormData['prompt'],
            'credentials' | 'instance_groups' | 'labels' | 'organization'
          >
        >
    ) => {
      if (payload.credentials) {
        await processCredentials(schedule.id, payload.credentials, payload.launch_config);
      }
      if (payload.instance_groups) {
        await processInstanceGroups(schedule.id, payload.instance_groups, payload.launch_config);
      }
      if (payload.labels) {
        await processLabels(
          schedule.id,
          payload.labels,
          payload.launch_config,
          payload.organization
        );
      }
    },
    [processCredentials, processInstanceGroups, processLabels]
  );
}
