import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useCallback } from 'react';
import { RuleListItemType, ScheduleFormWizard } from '../types';
import { applyStartDateTimeToRules } from './ruleHelpers';

export function useUpdateRules() {
  const { wizardData } = usePageWizard();

  return useCallback(
    (rules: RuleListItemType[]) => {
      const { timezone, startDateTime } = wizardData as ScheduleFormWizard;
      const updatedRules = applyStartDateTimeToRules(rules, startDateTime, timezone);

      // Return same reference if no changes to prevent infinite render loops
      const hasChanges = updatedRules.some((updated, index) => updated.rule !== rules[index].rule);
      return hasChanges ? updatedRules : rules;
    },
    [wizardData]
  );
}
