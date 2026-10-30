import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect, useState } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { Schedule } from '../../../interfaces/Schedule';
import { Survey } from '../../../interfaces/Survey';
import { ScheduleFormWizard, ScheduleResources } from '../types';
import { useGetSchedulePromptValues } from './useGetSchedulePromptValues';
import { getScheduleLabels } from './useProcessLabels';

export function useSchedulePromptDefaults(
  resourceId: number | null | undefined,
  scheduleType: string,
  scheduleId?: string
) {
  const { stepData, setStepData, wizardData, setWizardData } = usePageWizard<ScheduleFormWizard>();
  const getPromptValues = useGetSchedulePromptValues();
  const [error, setError] = useState<Error>();
  const initializedResourceId = stepData.promptStep?.resource?.id;
  const initializedResourceType = stepData.promptStep?.resource?.type;
  const hasConfig = Boolean(wizardData.launch_config);
  const ready =
    initializedResourceId === resourceId && initializedResourceType === scheduleType && hasConfig;

  useEffect(() => {
    if (!resourceId || !['job_template', 'workflow_job_template'].includes(scheduleType)) return;
    if (ready) return;
    let cancelled = false;
    setError(undefined);
    const initialize = async () => {
      const endpoint =
        scheduleType === 'job_template'
          ? awxAPI`/job_templates/${resourceId}/`
          : awxAPI`/workflow_job_templates/${resourceId}/`;
      const resource = await requestGet<ScheduleResources>(endpoint);
      const config = await requestGet<LaunchConfiguration>(`${endpoint}launch/`);
      const credentials =
        scheduleId && config.ask_credential_on_launch
          ? (
              await requestGet<AwxItemsResponse<Credential>>(
                awxAPI`/schedules/${scheduleId}/credentials/`
              )
            ).results
          : [];
      const instanceGroups =
        scheduleId && config.ask_instance_groups_on_launch
          ? (
              await requestGet<AwxItemsResponse<InstanceGroup>>(
                awxAPI`/schedules/${scheduleId}/instance_groups/`
              )
            ).results
          : [];
      const labels = scheduleId ? await getScheduleLabels(Number(scheduleId)) : [];
      const surveySpec =
        scheduleId && config.survey_enabled
          ? await requestGet<Survey>(`${endpoint}survey_spec/`)
          : undefined;
      const answers = surveySpec
        ? getSurveyAnswers(
            surveySpec,
            await requestGet<Schedule>(awxAPI`/schedules/${scheduleId ?? ''}/`)
          )
        : {};
      const { labels: draftLabels, ...prompt } = await getPromptValues(
        config,
        credentials,
        instanceGroups,
        labels,
        surveySpec
      );
      if (cancelled) return;
      setStepData((previous) => ({
        ...previous,
        promptStep: { prompt, resource, launch_config: config } as Partial<ScheduleFormWizard>,
        survey: Object.keys(answers).length ? { survey: answers } : previous.survey,
        details: { ...previous.details, resourceId, resource },
      }));
      setWizardData((previous) => ({
        ...previous,
        resource,
        resourceId,
        launch_config: config,
        prompt: { ...prompt, labels: draftLabels },
      }));
    };
    void initialize().catch((error: unknown) => {
      if (!cancelled) setError(error instanceof Error ? error : new Error(String(error)));
    });
    return () => {
      cancelled = true;
    };
  }, [resourceId, scheduleType, scheduleId, ready, getPromptValues, setStepData, setWizardData]);

  return { error, ready };
}

function getSurveyAnswers(survey: Survey, schedule: Schedule) {
  const answers: ScheduleFormWizard['survey'] = {};
  survey.spec?.forEach(({ variable }) => {
    const value = schedule.extra_data[variable];
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === 'string' || typeof value === 'number' || Array.isArray(value))
    ) {
      answers[variable] = value;
    }
  });
  return answers;
}
