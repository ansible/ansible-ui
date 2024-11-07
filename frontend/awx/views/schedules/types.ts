import { Weekday } from 'rrule';
import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';
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

export type RuleListItemType = { id: number; rule: string };
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
  endType: string | undefined;
}
export interface ScheduleFormWizard {
  resourceInventory?: number;
  name: string;
  description?: string;
  schedule_type: string;
  resource: ScheduleResources;
  resourceId?: number;
  startDateTime: { date: string; time: string };
  timezone: string;
  rules: RuleListItemType[];
  exceptions: RuleListItemType[] | [];
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
  schedule_days_to_keep: number;
  survey: { [key: string]: string };
  enabled: boolean;
}

export enum RuleType {
  Rules = 'rules',
  Exceptions = 'exceptions',
}

export interface schedulePageUrl {
  pageId: AwxRoute;
  params: {
    id: string;
    schedule_id: string;
    source_id?: string;
    inventory_type?: string;
  };
}

export type BaseSchedulePayload = {
  name: string;
  description?: string;
  timezone: string;
  rrule: string;
  unified_job_template?: number;
  extra_data?: { [x: string]: string };
};

export type ScheduleAccessoriesPayload = BaseSchedulePayload & {
  inventory?: number;
  scm_branch?: string;
  job_type?: string;
  job_tags?: string;
  skip_tags?: string;
  limit?: string;
  diff_mode?: boolean;
  verbosity?: number;
  enabled: boolean;
  execution_environment?: number | null;
  organization?: number | null;
  forks?: number;
  job_slice_count?: number;
  timeout?: number;
  credentials?: (
    | Credential
    | {
        id: number;
        name: string;
        credential_type: number;
        passwords_needed?: string[];
        vault_id?: string;
      }
  )[];
  labels?: { name: string; id: number }[];
  instance_groups?: { id: number; name: string }[];
};
