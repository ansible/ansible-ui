import { InstanceGroup } from './InstanceGroup';
import { InventorySource } from './InventorySource';
import { JobTemplate } from './JobTemplate';
import { Project } from './Project';
import { Schedule } from './Schedule';
import { WorkflowJobTemplate } from './WorkflowJobTemplate';

export interface ScheduleFormFields
  extends Omit<
    Schedule,
    'unified_job_template' | 'timezone' | 'inventory' | 'execution_environment'
  > {
  unified_job_template_object: JobTemplate | WorkflowJobTemplate | Project | InventorySource;
  unified_job_template: number;
  resourceName: string;
  name: string;
  description?: string;
  resource_type: string;
  startDateTime: { startDate: string; startTime: string };
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
  organizationId?: number;
  extra_vars?: string;
  defaultInstanceGroups: InstanceGroup[];
  newInstanceGroups: InstanceGroup[];
  arrayedSkipTags: { name: string }[];
  arrayedJobTags: { name: string }[];
  inventory: {
    name: string;
    id: number;
  };
  inventoryId: number;
  labels: { name: string; id: number }[];
  newLabels: { id: number; name: string }[];
  limit: string;
  scm_branch: string;
  job_tags: string;
  skip_tags: string;
  diff_mode: boolean;
  job_type: 'run' | 'check';
  verbosity: '0' | '1' | '2' | '3' | '4' | '5';
  credentials?: [
    {
      id: number;
      name: string;
      credential_type: number;
      passwords_needed: string[];
    }
  ];
  newCredentials: [
    {
      id: number;
      name: string;
      credential_type: number;
      passwords_needed: string[];
    }
  ];
  execution_environment: { id: number; name: string };
  executionEnvironmentId: number;
  forks: number;
  job_slice_count: number;
  timeout: number;
  instance_groups: [];

  job_template_data: {
    name: string;
    id: number;
    description: string;
  };
}
