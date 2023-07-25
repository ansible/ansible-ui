import { RegularInventory } from './Inventory';
import { InventorySource } from './InventorySource';
import { JobTemplate } from './JobTemplate';
import { Project } from './Project';
import { Schedule } from './Schedule';
import { WorkflowJobTemplate } from './WorkflowJobTemplate';

export interface ScheduleFormFields
  extends Omit<Schedule, 'unified_job_template' | 'timezone' | 'inventory'> {
  unified_job_template: JobTemplate | WorkflowJobTemplate | Project | InventorySource;
  resourceName: string;
  name: string;
  description?: string;
  resource_type: string;
  startDateTime: { startDate: string; startTime: string };
  timezone: string;
  inventory: RegularInventory | null;
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
