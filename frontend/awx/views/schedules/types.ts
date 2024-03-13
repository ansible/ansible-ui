import { Weekday } from 'rrule';
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
export interface Occurrence {
  id: number;
  freq: number | null;
  interval: number | null;
  wkst: Weekday;
  byweekday: null;
  byweekno: null;
  bymonth: null;
  bymonthday: null;
  byyearday: null;
  bysetpos: null;
  byminute: null;
  byhour: null;
  until: null;
  endDate: string | null;
  endTime: string | null;
  count: null;
  endingType: string | null;
}
export interface ScheduleFormWizard {
  details: {
    unified_job_template_object: ScheduleResources | null;
    unified_job_template: number | undefined;
    resourceName: string;
    name: string;
    description?: string;
    resource_type: string;
    startDateTime: { date: string; time: string };
    timezone: string;
  };
  occurrence: Occurrence | null;
  occurrences: Occurrence[];
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
}
