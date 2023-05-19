import { Schedule } from './Schedule';

export interface ScheduleFormFields extends Omit<Schedule, 'timezone'> {
  unified_job_template: number;
  resourceName: string;
  name: string;
  description?: string;
  resource_type: string;
  startDateTime: { startDate: string; startTime: string };
  timezone: string;
  inventory: number | null;
  frequencies: string[];
  freq: number;
  interval: number;
  wkst: string;
  byweekday: number | number[]; //iCalendar RFC's equivalent to the byday keyword
  byweekno: number | number[];
  bymonth: number | number[];
  bymonthday: number;
  byyearday: number;
  bysetpos: number;
  until: string;
  endDate: string;
  endTime: string;
  count: number;
  endingType: 'never';
}
