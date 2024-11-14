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
        const newRule = RRule.optionsToString({
          ...RRule.fromString(rule).origOptions,
          tzid: timezone,
          dtstart: datetime(year, month, day, hour, minute),
        });
        return { rule: newRule, id };
      });
      return updatedRules;
    },
    [getStart, wizardData]
  );
}
