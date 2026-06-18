import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { datetime, RRule } from 'rrule';
import { RuleListItemType, ScheduleFormWizard } from '../types';
import { useGet24HourTime } from './useGet24HourTime';

export function useUpdateRules() {
  const { wizardData } = usePageWizard();
  const getStart = useGet24HourTime();

  return useCallback(
    (rules: RuleListItemType[]) => {
      const {
        timezone,
        startDateTime: { date, time },
      } = wizardData as ScheduleFormWizard;

      const { year, month, day, hour, minute } = DateTime.fromISO(`${date}`).set(getStart(time));

      const updatedRules = (rules || []).map(({ rule, id }) => {
        let newRule = RRule.optionsToString({
          ...RRule.fromString(rule).origOptions,
          tzid: timezone,
          dtstart: datetime(year, month, day, hour, minute),
        });

        // RFC5545: When DTSTART has TZID, UNTIL must be in UTC with Z suffix
        // The rrule library doesn't preserve the Z suffix when re-serializing, so we add it back
        if (newRule.match(/UNTIL=\d{8}T\d{6}(?!Z)/)) {
          newRule = newRule.replace(/UNTIL=(\d{8}T\d{6})(?!Z)/, 'UNTIL=$1Z');
        }

        return { rule: newRule, id };
      });

      // Return same reference if no changes to prevent infinite render loops
      const hasChanges = updatedRules.some((updated, index) => updated.rule !== rules[index].rule);
      return hasChanges ? updatedRules : rules;
    },
    [getStart, wizardData]
  );
}
