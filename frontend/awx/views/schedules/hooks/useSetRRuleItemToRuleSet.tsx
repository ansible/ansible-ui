import { useCallback } from 'react';
import { RRule, RRuleSet } from 'rrule';
import { RuleListItemType } from '../types';

export function useSetRRuleItemToRuleSet() {
  return useCallback((rules: RuleListItemType[], exceptions: RuleListItemType[] | []) => {
    const ruleset = new RRuleSet();

    rules.forEach((r, i) => {
      const {
        rule: {
          options: { dtstart, tzid, ...rest },
        },
      } = r;
      if (i === 0) {
        ruleset.rrule(new RRule({ ...rest, dtstart, tzid }));
      } else {
        ruleset.rrule(new RRule({ ...rest }));
      }
    });
    if (exceptions.length) {
      exceptions?.forEach((r) => {
        const {
          rule: {
            options: { dtstart, tzid, ...rest },
          },
        } = r;
        ruleset.exrule(new RRule({ ...rest }));
      });
    }
    return ruleset;
  }, []);
}
