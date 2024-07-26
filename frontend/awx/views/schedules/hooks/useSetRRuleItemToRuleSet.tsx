import { useCallback } from 'react';
import { RRule, RRuleSet } from 'rrule';
import { RuleListItemType } from '../types';
import { DateTime } from 'luxon';

export function useSetRRuleItemToRuleSet() {
  return useCallback((rules: RuleListItemType[], exceptions: RuleListItemType[] | []) => {
    const ruleset = new RRuleSet();
    rules.forEach((r, i) => {
      // buildRuleObj(r);
      // const rule = new RRule();
      const {
        rule: {
          options: { dtstart, tzid, until, ...rest },
        },
      } = r;
      console.log({ until });
      if (i === 0) {
        // rule.options.until = until;
        // rule.options.dtstart = dtstart;
        // rule.options.tzid = tzid;
        ruleset.rrule(new RRule({ dtstart, tzid, until: until ? until.to : null, ...rest }));
      } else {
        // rule.options = r.rule.options;
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

export function buildRuleObj(values: RRule) {
  const ruleObj = {
    interval: values.options.interval,
  };

  ruleObj.dtstart = buildDateTime(values.startDate, values.startTime, values.timezone);

  // switch (values.frequenc) {
  //   case 'none':
  //     ruleObj.count = 1;
  //     ruleObj.freq = RRule.MINUTELY;
  //     break;
  //   case 'minute':
  //     ruleObj.freq = RRule.MINUTELY;
  //     break;
  //   case 'hour':
  //     ruleObj.freq = RRule.HOURLY;
  //     break;
  //   case 'day':
  //     ruleObj.freq = RRule.DAILY;
  //     break;
  //   case 'week':
  //     ruleObj.freq = RRule.WEEKLY;
  //     ruleObj.byweekday = values.daysOfWeek;
  //     break;
  //   case 'month':
  //     ruleObj.freq = RRule.MONTHLY;
  //     if (values.runOn === 'day') {
  //       ruleObj.bymonthday = values.runOnDayNumber;
  //     } else if (values.runOn === 'the') {
  //       ruleObj.bysetpos = parseInt(values.runOnTheOccurrence, 10);
  //       ruleObj.byweekday = getRRuleDayConstants(values.runOnTheDay);
  //     }
  //     break;
  //   case 'year':
  //     ruleObj.freq = RRule.YEARLY;
  //     if (values.runOn === 'day') {
  //       ruleObj.bymonth = parseInt(values.runOnDayMonth, 10);
  //       ruleObj.bymonthday = values.runOnDayNumber;
  //     } else if (values.runOn === 'the') {
  //       ruleObj.bysetpos = parseInt(values.runOnTheOccurrence, 10);
  //       ruleObj.byweekday = getRRuleDayConstants(values.runOnTheDay);
  //       ruleObj.bymonth = parseInt(values.runOnTheMonth, 10);
  //     }
  //     break;
  //   default:
  //     throw new Error(t`Frequency did not match an expected value`);
  // }

  if (values.freq !== 'date') {
    switch (values.end) {
      case 'never':
        break;
      case 'after':
        ruleObj.count = values.occurrences;
        break;
      case 'onDate': {
        ruleObj.until = buildDateTime(values.endDate, values.endTime, values.timezone);
        break;
      }
      default:
        throw new Error(t`End did not match an expected value (${values.end})`);
    }
  }

  return ruleObj;
}
export function buildDateTime(dateString: string, timeString: string, timezone: string): Date {
  const localDate = DateTime.fromISO(`${dateString}T000000`, {
    zone: timezone,
  });
  const [hour, minute] = parseTime(timeString);
  console.log({ hour, minute, timeString });
  const localTime = localDate.set({
    hour,
    minute,
    second: 0,
  });
  return localTime.toJSDate();
}
const parseTime = (time: string) => {
  return [DateTime.fromFormat(time, 'hh:mm a').hour, DateTime.fromFormat(time, 'hh:mm a').minute];
};
