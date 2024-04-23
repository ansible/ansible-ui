import { useCallback } from 'react';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { useProcessCredentials } from './useProcessCredentials';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';
import { useProcessLabels } from './useProcessLabels';
import { StandardizedFormData } from '../wizard/ScheduleAddWizard';
import { stringifyTags } from '../../../resources/templates/JobTemplateFormHelpers';
import { useParams } from 'react-router-dom';
import { usePatchRequest } from '../../../../common/crud/usePatchRequest';

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
  unified_job_template?: number;
};

export const useProcessSchedule = () => {
  const params = useParams<{ id?: string; schedule_id: string }>();
  const postAccessories = usePostAccessories();
  const postSchedule = usePostRequest<CreateSchedulePayload, Schedule>();
  const updateSchedule = usePatchRequest<CreateSchedulePayload, Schedule>();
  return useCallback(
    async (payloadData: StandardizedFormData) => {
      const { resource, prompt, schedule_days_to_keep, ...rest } = payloadData;
      const request = (endPoint: string, payload: CreateSchedulePayload) => {
        if (params.schedule_id && params.id) {
          return updateSchedule(awxAPI`/schedules/${params.schedule_id.toString()}/`, {
            ...payload,
            unified_job_template: parseInt(params?.id, 10),
          });
        }
        return postSchedule(endPoint, payload);
      };

      const {
        execution_environment,
        credentials,
        job_tags,
        skip_tags,
        inventory,
        ...restOfPrompt
      } = prompt || { execution_environment: null, job_tags: '', skip_tags: '' };
      const { type, id } = resource;
      let schedule: Schedule;
      const hasJobTags = job_tags && job_tags?.length > 0;
      const hasSkipTags = prompt && prompt?.skip_tags && prompt?.skip_tags?.length > 0;
      const extraDataObject = schedule_days_to_keep ? { days: schedule_days_to_keep } : {};
      const payload = {
        ...rest,
        ...restOfPrompt,
        inventory: inventory?.id,
        execution_environment: execution_environment?.id,
        skip_tags: hasSkipTags ? stringifyTags(prompt?.skip_tags) : undefined,
        job_tags: hasJobTags ? stringifyTags(job_tags) : undefined,
        enabled: true,
        extra_data: extraDataObject,
      };
      switch (type) {
        case 'inventory_source':
          return {
            schedule: await request(
              awxAPI`/inventory_sources/${id.toString()}/schedules/`,
              payload
            ),
          };
        case 'project':
          return {
            schedule: await request(awxAPI`/projects/${id.toString()}/schedules/`, payload),
          };
        case 'system_job_template':
          return {
            schedule: await request(
              awxAPI`/system_job_templates/${id.toString()}/schedules/`,
              payload
            ),
          };
        case 'workflow_job_template':
          schedule = await request(
            awxAPI`/workflow_job_templates/${id.toString()}/schedules/`,
            payload
          );
          await postAccessories(schedule, payload);
          return {
            schedule,
          };
        default:
          schedule = await request(awxAPI`/job_templates/${id.toString()}/schedules/`, payload);
          await postAccessories(schedule, payload);

          return {
            schedule,
          };
      }
    },
    [params.schedule_id, updateSchedule, postSchedule, params.id, postAccessories]
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
