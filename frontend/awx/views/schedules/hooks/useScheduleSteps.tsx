import { PageWizardBasicStep } from '@ansible/ansible-ui-framework/PageWizard/types';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { SurveyStep } from '../../../common/SurveyStep';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { NodePromptsStep as PromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { RuleFields, ScheduleFormWizard } from '../types';
import { ensureUntilZSuffix } from './ruleHelpers';
import { ExceptionsStep } from '../wizard/ExceptionsStep';
import { RulesStep } from '../wizard/RulesStep';
import { ScheduleReviewStep } from '../wizard/ScheduleReviewStep';
import { ScheduleSelectStep } from '../wizard/ScheduleSelectStep';
import { ScheduleLabelsInput } from '../components/ScheduleLabelsInput';
import { useSetRRuleItemToRuleSet } from './useSetRRuleItemToRuleSet';

export function useScheduleSteps() {
  const { t } = useTranslation();
  const getRuleSet = useSetRRuleItemToRuleSet();
  return useCallback(
    (resourceEndPoint?: string, isTopLevelSchedule?: boolean): PageWizardBasicStep[] => [
      {
        id: 'details',
        label: t('Details'),
        validate: (
          formData: Partial<ScheduleFormWizard>,
          wizardData: Partial<ScheduleFormWizard>
        ) => {
          const isTemplate = ['job_template', 'workflow_job_template'].includes(
            formData.schedule_type ?? ''
          );
          if (
            isTemplate &&
            (!wizardData.launch_config ||
              wizardData.resource?.id !== formData.resourceId ||
              wizardData.resource?.type !== formData.schedule_type)
          ) {
            throw new Error(t('Wait for the schedule configuration to load.'));
          }
        },
        inputs: (
          <ScheduleSelectStep
            isTopLevelSchedule={isTopLevelSchedule}
            resourceEndPoint={resourceEndPoint}
          />
        ),
      },
      {
        id: 'promptStep',
        label: t('Prompts'),
        inputs: (
          <PromptsStep
            preventCredentialsThatNeedPasswordsOnLaunch
            labelsInput={<ScheduleLabelsInput />}
          />
        ),
        validate: (
          formData: Partial<ScheduleFormWizard>,
          wizardData: Partial<ScheduleFormWizard>
        ) => ({
          prompt: { ...formData.prompt, labels: wizardData.prompt?.labels },
        }),
        hidden: (wizardData: Partial<ScheduleFormWizard>) => {
          const { launch_config, resource, resourceId, schedule_type } = wizardData;

          const isTemplate =
            schedule_type === 'job_template' ||
            schedule_type === 'workflow_job_template' ||
            resource?.type === 'job_template' ||
            resource?.type === 'workflow_job_template';
          if (isTemplate && (resource || resourceId) && launch_config) {
            return shouldHideOtherStep(launch_config);
          }
          return true;
        },
      },
      {
        id: 'survey',
        label: t('Survey'),
        inputs: <SurveyStep />,
        hidden: (wizardData: Partial<ScheduleFormWizard>) =>
          !['job_template', 'workflow_job_template'].includes(wizardData.schedule_type ?? '') ||
          !wizardData.launch_config?.survey_enabled,
      },
      {
        id: 'rules',
        label: t('Rules'),
        inputs: <RulesStep />,
        validate: (formData: Partial<RuleFields>) => {
          if (!formData?.rules?.length) {
            const errors = {
              __all__: [t('Schedules must have at least one rule.')],
            };

            throw new RequestError('', '', 400, '', errors);
          }
        },
      },
      {
        id: 'exceptions',
        label: t('Exceptions'),
        inputs: <ExceptionsStep />,
      },
      {
        id: 'review',
        label: t('Review'),
        inputs: <ScheduleReviewStep />,
        validate: async (_formData: object, wizardData: Partial<ScheduleFormWizard>) => {
          if (!wizardData?.rules?.length) {
            const errors = {
              __all__: [t('Schedules must have at least one rule.')],
            };

            throw new RequestError('', '', 400, '', errors);
          }

          const ruleset = getRuleSet(wizardData.rules, wizardData.exceptions ?? []);
          const { utc, local } = await postRequest<{ utc: string[]; local: string[] }>(
            awxAPI`/schedules/preview/`,
            {
              rrule: ensureUntilZSuffix(ruleset.toString().replaceAll('\n', ' ')),
            }
          );
          if (!local.length && !utc.length) {
            const errors = {
              __all__: [
                t(
                  'This schedule will never run.  If you have defined exceptions it is likely that the exceptions cancel out all the rules defined in the rules step.'
                ),
              ],
            };

            throw new RequestError('', '', 400, '', errors);
          }
        },
      },
    ],
    [getRuleSet, t]
  );
}
