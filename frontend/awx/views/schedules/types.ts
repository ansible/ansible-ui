import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { SystemJob } from '../../interfaces/generated-from-swagger/api';
import { PromptFormValues } from '../../resources/templates/WorkflowVisualizer/types';

export type ScheduleResources =
  | InventorySource
  | SystemJob
  | JobTemplate
  | Project
  | WorkflowJobTemplate;

export interface ScheduleFormWizard {
  unified_job_template_object: ScheduleResources | null;
  unified_job_template: number;
  resourceName: string;
  name: string;
  description?: string;
  resource_type: string;
  startDateTime: { date: string; time: string };
  timezone: string;
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
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
}
