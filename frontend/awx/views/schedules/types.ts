import { RRule, Weekday } from 'rrule';
import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { SystemJob } from '../../interfaces/generated-from-swagger/api';
import { PromptFormValues } from '../../resources/templates/WorkflowVisualizer/types';

export enum Frequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
}

export type RuleListItemType = { id: number; rule: RRule };
export type ScheduleResources =
  | InventorySource
  | SystemJob
  | JobTemplate
  | Project
  | WorkflowJobTemplate;
export interface RuleFields {
  id: number | undefined;
  freq: Frequency;
  interval: number | undefined;
  wkst: Weekday;
  byweekday: null;
  byweekno: null;
  bymonth: null;
  bymonthday: null;
  byyearday: null;
  bysetpos: null;
  byminute: null;
  byhour: null;
  until: { date: string; time: string } | null;
  count: null;
  endingType: string | null;
  rules: RuleListItemType[] | [];
  exceptions: RuleListItemType[] | [];
}
export interface ScheduleFormWizard {
  unified_job_template_object: ScheduleResources | null;
  unified_job_template: number | undefined;
  inventory?: number;
  resourceName: string;
  name: string;
  description?: string;
  resource_type: string;
  startDateTime: { date: string; time: string };
  timezone: string;
  occurrences: RuleFields | null;
  exceptions: RuleFields | null;
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
  rules: RuleListItemType[];
}

export interface PreviewSchedule {
  local?: string[];
  utc?: string[];
  rrule: string;
}

export enum RuleType {
  Rules = 'rules',
  Exceptions = 'exceptions',
}
