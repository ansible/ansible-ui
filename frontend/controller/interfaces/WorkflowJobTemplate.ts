import { WorkflowJobTemplate as SwaggerWorkflowJobTemplate } from './generated-from-swagger/api';
import { SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface WorkflowJobTemplate
  extends Omit<SwaggerWorkflowJobTemplate, 'id' | 'name' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number };
      execute_role: { id: number };
      read_role: { id: number };
      approval_role: { id: number };
    };
  };
}
