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
  endingType: string | null;
  rules: RuleListItemType[] | [];
  exceptions: RuleListItemType[] | [];
}
export interface ScheduleFormWizard {
  resourceInventory?: number;
  name: string;
  description?: string;
  node_type: string;
  node_resource: ScheduleResources;
  startDateTime: { date: string; time: string };
  timezone: string;
  rules: RuleListItemType[];
  exceptions: RuleListItemType[] | [];
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
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

export interface ScheduleRoutes {
  scheduleDetailsRoute?: boolean;
  scheduleCreateRoute?: boolean;
  scheduleEditRoute?: boolean;
  resourceDetailsRoute?: boolean;
}

export type JobTypeLabel = {
  [key: string]: scheduleResourceRoute;
};

export interface scheduleResourceRoute {
  name: string;
  scheduleDetailsRoute?: string;
  scheduleCreateRoute?: string;
  scheduleEditRoute?: string;
  resourceDetailsRoute?: string;
}
