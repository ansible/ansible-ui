import { Label } from './Label';
import { WorkflowJob as SwaggerWorkflowJob } from './generated-from-swagger/api';

import {
  SummaryFieldsByUser,
  SummaryFieldWorkflowJobTemplate,
  SummaryFieldUnifiedJobTemplate,
  SummaryFieldInventory,
} from './summary-fields/summary-fields';

export interface WorkflowJob
  extends Omit<
    SwaggerWorkflowJob,
    'id' | 'name' | 'summary_fields' | 'launched_by' | 'extra_vars'
  > {
  id: number;
  name: string;
  summary_fields: {
    inventory?: SummaryFieldInventory;
    job?: {
      id: number;
      name: string;
      description: string;
      status: string;
      failed: false;
      elapsed: number;
      type: string;
    };
    workflow_job_template: SummaryFieldWorkflowJobTemplate;
    unified_job_template: SummaryFieldUnifiedJobTemplate;
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    user_capabilities: {
      delete: boolean;
      start: boolean;
    };
    labels: {
      count: number;
      results: Label[];
    };
  };
  launched_by: {
    id?: number;
    name?: string;
    type?: string;
    url?: string;
  };
  extra_vars: string;
}
