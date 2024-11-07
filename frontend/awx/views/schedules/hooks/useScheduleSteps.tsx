import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useSetRRuleItemToRuleSet } from './useSetRRuleItemToRuleSet';
import { ScheduleSelectStep } from '../wizard/ScheduleSelectStep';
import { NodePromptsStep as PromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { RuleFields, ScheduleFormWizard } from '../types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { SurveyStep } from '../../../common/SurveyStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { RulesStep } from '../wizard/RulesStep';
import { RequestError } from '../../../../common/crud/RequestError';
import { ExceptionsStep } from '../wizard/ExceptionsStep';
import { ScheduleReviewStep } from '../wizard/ScheduleReviewStep';
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

export function useScheduleSteps() {
  const { t } = useTranslation();
  const getRuleSet = useSetRRuleItemToRuleSet();
  return useCallback(
    (resourceEndPoint?: string, isTopLevelSchedule?: boolean) => [
      {
        id: 'details',
        label: t('Details'),
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
        inputs: <PromptsStep preventCredentialsThatNeedPasswordsOnLaunch />,
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
        hidden: (wizardData: Partial<WizardFormValues>) => {
          if (Object.keys(wizardData).length === 0) {
            return true;
          }
          if (wizardData.launch_config?.survey_enabled) {
            return false;
          }
          return true;
        },
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
              rrule: ruleset.toString().split('\n').join(' '),
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
