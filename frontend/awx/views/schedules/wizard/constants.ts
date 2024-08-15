import { Frequency, RRule } from 'rrule';
export const INVENTORY_TYPE = 'inventory';
export const RULES_DEFAULT_VALUES = {
  freq: Frequency.YEARLY,
  interval: 1,
  wkst: RRule.SU,
  byweekday: null,
  byweekno: null,
  bymonth: null,
  bymonthday: null,
  byyearday: null,
  bysetpos: null,
  until: { date: '', time: '' },
  count: null,
  byminute: null,
  byhour: null,
  endType: 'never',
};

export const WEEKS_OF_YEAR = Array.from({ length: 52 }, (_, i) => i + 1).map((week) => ({
  value: week,
  label: `${week}`,
}));
export const DAYS_OF_YEAR = Array.from(Array(366), (_, i) => i + 1).map((day) => ({
  value: day,
  label: `${day}`,
}));
export const MINUTES_OF_HOUR = Array.from(Array(60), (_, i) => i).map((minute) => ({
  value: minute,
  label: `${minute}`,
}));

export const DAYS_OF_MONTH = Array.from(Array(31), (_, i) => i + 1).map((day) => ({
  value: day,
  label: `${day}`,
}));

export const HOURS_OF_DAY = Array.from(Array(24), (_, i) => i).map((hour) => ({
  value: hour,
  label: `${hour}`,
}));
