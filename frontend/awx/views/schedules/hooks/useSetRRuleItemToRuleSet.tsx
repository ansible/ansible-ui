import { useCallback } from 'react';
import { RRule, RRuleSet } from 'rrule';
import { RuleListItemType } from '../types';

export function useSetRRuleItemToRuleSet() {
  return useCallback((rules: RuleListItemType[], exceptions: RuleListItemType[] | []) => {
    const ruleset = new RRuleSet();
    rules.forEach(({ rule }, i) => {
      const ruleObject = RRule.fromString(rule).origOptions;
      const { dtstart, tzid, ...rest } = ruleObject;
      if (i === 0) {
        ruleset.rrule(new RRule({ ...rest, dtstart, tzid }));
        return;
      }
      ruleset.rrule(new RRule({ ...rest }));
    });
    exceptions.length > 0 &&
      exceptions.forEach(({ rule }) => {
        const exceptionObject = RRule.fromString(rule).origOptions;

        const { dtstart, tzid, ...rest } = exceptionObject;
        ruleset.exrule(new RRule({ ...rest }));
      });
    return ruleset;
  }, []);
}
