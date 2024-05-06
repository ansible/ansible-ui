import { RRule, Weekday } from 'rrule';
import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { PromptFormValues } from '../../resources/templates/WorkflowVisualizer/types';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';

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
  | SystemJobTemplate
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
  rules: RuleListItemType[] | [];
  exceptions: RuleListItemType[] | [];
}
export interface ScheduleFormWizard {
  resourceInventory?: number;
  name: string;
  description?: string;
  schedule_type: string;
  resource: ScheduleResources;
  startDateTime: { date: string; time: string };
  timezone: string;
  rules: RuleListItemType[];
  exceptions: RuleListItemType[] | [];
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
  schedule_days_to_keep: number;
  survey: { [key: string]: string };
}

export type ScheduleResourceType =
  | 'job'
  | 'workflow_job'
  | 'project_update'
  | 'inventory_update'
  | 'system_job';

export interface PreviewSchedule {
  local?: string[];
  utc?: string[];
  rrule: string;
}

export enum RuleType {
  Rules = 'rules',
  Exceptions = 'exceptions',
}

export interface schedulePageUrl {
  pageId: string;
  params: {
    id: string;
    schedule_id: string;
    source_id?: string;
  };
}
