import { Organization as SwaggerOrganization } from './generated-from-swagger/api';
import {
  SummaryFieldsByUser,
  SummaryFieldsExecutionEnvironment,
  SummeryFieldObjectRole,
} from './summary-fields/summary-fields';

export interface Organization extends Omit<SwaggerOrganization, 'id' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: SummeryFieldObjectRole;
      execute_role: SummeryFieldObjectRole;
      project_admin_role: SummeryFieldObjectRole;
      inventory_admin_role: SummeryFieldObjectRole;
      credential_admin_role: SummeryFieldObjectRole;
      workflow_admin_role: SummeryFieldObjectRole;
      notification_admin_role: SummeryFieldObjectRole;
      job_template_admin_role: SummeryFieldObjectRole;
      execution_environment_admin_role: SummeryFieldObjectRole;
      auditor_role: SummeryFieldObjectRole;
      member_role: SummeryFieldObjectRole;
      read_role: SummeryFieldObjectRole;
      approval_role: SummeryFieldObjectRole;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
    related_field_counts: {
      inventories: number;
      teams: number;
      users: number;
      job_templates: number;
      admins: number;
      projects: number;
    };
    default_environment: SummaryFieldsExecutionEnvironment;
  };
}

export type AwxOrganizationCreate = Omit<Organization, 'id' | 'summary_fields'>;
