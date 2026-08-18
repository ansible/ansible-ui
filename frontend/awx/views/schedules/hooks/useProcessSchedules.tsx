import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { BaseSchedulePayload, ScheduleAccessoriesPayload, ScheduleFormWizard } from '../types';
import { ensureUntilZSuffix, mungePromptData, mungeSurveyAndExtraVarsData } from './ruleHelpers';
import { usePostAccessories } from './usePostScheduleAccessories';
import { useSetRRuleItemToRuleSet } from './useSetRRuleItemToRuleSet';

export const useProcessSchedule = () => {
  const params = useParams<{ id?: string; schedule_id: string }>();
  const postAccessories = usePostAccessories();
  const postSchedule = usePostRequest<BaseSchedulePayload | ScheduleAccessoriesPayload, Schedule>();
  const updateSchedule = usePatchRequest<
    BaseSchedulePayload | ScheduleAccessoriesPayload,
    Schedule
  >();
  const getRuleSet = useSetRRuleItemToRuleSet();
  return useCallback(
    async (payloadData: ScheduleFormWizard) => {
      const { resourceId, resource, prompt, survey, rules, exceptions, ...rest } = payloadData;
      const ruleset = getRuleSet(rules, exceptions);

      const rrule = ensureUntilZSuffix(ruleset.toString().replaceAll('\n', ' '));

      const payload = {
        ...rest,
        rrule,
      };

      function request(
        endPoint: string,
        payload: BaseSchedulePayload | ScheduleAccessoriesPayload
      ) {
        if (params.schedule_id && params.id) {
          return updateSchedule(awxAPI`/schedules/${params.schedule_id.toString()}/`, {
            ...payload,
            unified_job_template: resource.id,
          });
        }

        return postSchedule(endPoint, payload);
      }

      const { type, id } = resource;

      let schedule: Schedule;
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
        case 'system_job_template': {
          const extraDataObject: { [key: string]: string } = {};

          if (payloadData.schedule_days_to_keep !== undefined) {
            Object.assign(extraDataObject, { days: payloadData.schedule_days_to_keep });
          }
          return {
            schedule: await request(awxAPI`/system_job_templates/${id.toString()}/schedules/`, {
              ...payload,
              extra_data: extraDataObject,
            }),
          };
        }
        case 'workflow_job_template': {
          const promptData = mungePromptData(prompt, payloadData.launch_config);
          const requestPayload: BaseSchedulePayload | ScheduleAccessoriesPayload = {
            ...payload,
            ...promptData,
            extra_data: mungeSurveyAndExtraVarsData(survey ?? {}, prompt?.extra_vars ?? ''),
          };
          schedule = await request(
            awxAPI`/workflow_job_templates/${id.toString()}/schedules/`,
            requestPayload
          );
          await postAccessories(schedule, {
            launch_config: payloadData.launch_config,
            credentials: prompt?.credentials,
            instance_groups: prompt?.instance_groups,
            labels: prompt?.labels,
            organization: prompt?.organization,
          });
          return {
            schedule,
          };
        }
        default: {
          const promptData = mungePromptData(prompt, payloadData.launch_config);
          const requestPayload: BaseSchedulePayload | ScheduleAccessoriesPayload = {
            ...payload,
            ...promptData,
            extra_data: mungeSurveyAndExtraVarsData(survey ?? {}, prompt?.extra_vars ?? ''),
          };
          schedule = await request(
            awxAPI`/job_templates/${id.toString()}/schedules/`,
            requestPayload
          );
          if (prompt !== undefined && payloadData.launch_config !== undefined) {
            await postAccessories(schedule, {
              launch_config: payloadData.launch_config,
              credentials: prompt.credentials,
              instance_groups: prompt.instance_groups,
              labels: prompt.labels,
              organization: prompt.organization,
            });
          }

          return {
            schedule,
          };
        }
      }
    },
    [params.schedule_id, updateSchedule, postSchedule, getRuleSet, params.id, postAccessories]
  );
};
