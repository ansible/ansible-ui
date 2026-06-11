import { Schedule as SwaggerSchedule } from './generated-from-swagger/api';
import { SummaryFieldInventory, SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface Schedule
  extends Omit<
    SwaggerSchedule,
    | 'summary_fields'
    | 'id'
    | 'name'
    | 'related'
    | 'enabled'
    | 'next_run'
    | 'rrule'
    | 'job_tags'
    | 'skip_tags'
  > {
  id: number;
  next_run?: string;
  rrule: string;
  name: string;
  dtstart: string;
  timezone: string;
  enabled: boolean;
  created: string;
  modified: string;
  skip_tags: string;
  job_tags: string;
  related: { unified_job_template: string };
  summary_fields: {
    unified_job_template: {
      id: number;
      name: string;
      description: string;
      unified_job_type: string;
      job_type: string;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    inventory?: SummaryFieldInventory;
    execution_environment?: { id: number; name: string; image: string; description: string };
  };
  extra_data: {
    days?: number;
    [key: string]: unknown;
  };
}
