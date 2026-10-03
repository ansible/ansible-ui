import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { BaseSchedulePayload, ScheduleAccessoriesPayload, ScheduleFormWizard } from '../types';
import { ensureUntilZSuffix, mungePromptData, mungeSurveyAndExtraVarsData } from './ruleHelpers';
import { usePostAccessories } from './usePostScheduleAccessories';
import { useProcessLabels } from './useProcessLabels';
import { useSetRRuleItemToRuleSet } from './useSetRRuleItemToRuleSet';

export const useProcessSchedule = () => {
  const params = useParams<{ id?: string; schedule_id: string }>();
  const postAccessories = usePostAccessories();
  const processLabels = useProcessLabels();
  const createdScheduleId = useRef<number>();
  const postSchedule = usePostRequest<BaseSchedulePayload | ScheduleAccessoriesPayload, Schedule>();
  const updateSchedule = usePatchRequest<
    BaseSchedulePayload | ScheduleAccessoriesPayload,
    Schedule
  >();
  const getRuleSet = useSetRRuleItemToRuleSet();
  return useCallback(
    async (payloadData: ScheduleFormWizard) => {
      const { resourceId, resource, prompt, launch_config, survey, rules, exceptions, ...rest } =
        payloadData;
      const ruleset = getRuleSet(rules, exceptions);

      const rrule = ensureUntilZSuffix(ruleset.toString().replaceAll('\n', ' '));

      const payload = {
        ...rest,
        rrule,
      };

      async function request(
        endPoint: string,
        payload: BaseSchedulePayload | ScheduleAccessoriesPayload
      ) {
        const scheduleId =
          params.schedule_id && params.id ? params.schedule_id : createdScheduleId.current;
        if (scheduleId) {
          return updateSchedule(awxAPI`/schedules/${scheduleId.toString()}/`, payload);
        }

        const schedule = await postSchedule(endPoint, payload);
        // Keep a partially saved schedule so retry reconciles it instead of creating a duplicate.
        createdScheduleId.current = schedule.id;
        return schedule;
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
        case 'workflow_job_template':
        default: {
          const promptData = mungePromptData(prompt, launch_config);
          const requestPayload: BaseSchedulePayload | ScheduleAccessoriesPayload = {
            ...payload,
            ...promptData,
            extra_data: mungeSurveyAndExtraVarsData(survey ?? {}, prompt?.extra_vars ?? ''),
          };
          schedule = await request(
            type === 'workflow_job_template'
              ? awxAPI`/workflow_job_templates/${id.toString()}/schedules/`
              : awxAPI`/job_templates/${id.toString()}/schedules/`,
            requestPayload
          );
          await processLabels(schedule.id, prompt?.labels, resource.organization);
          if (
            type === 'workflow_job_template' ||
            (prompt !== undefined && launch_config !== undefined)
          ) {
            await postAccessories(schedule, {
              launch_config,
              credentials: prompt?.credentials,
              instance_groups: prompt?.instance_groups,
            });
          }

          return {
            schedule,
          };
        }
      }
    },
    [
      params.schedule_id,
      updateSchedule,
      postSchedule,
      getRuleSet,
      params.id,
      postAccessories,
      processLabels,
    ]
  );
};
