import { Organization as SwaggerOrganization } from './generated-from-swagger/api';
import {
  SummaryFieldObjectRole,
  SummaryFieldsByUser,
  SummaryFieldsExecutionEnvironment,
} from './summary-fields/summary-fields';

export interface Organization extends Omit<SwaggerOrganization, 'id' | 'summary_fields'> {
  id: number;
  name: string;
  summary_fields: {
    resource: {
      ansible_id: string;
      resource_type: 'shared.organization';
    };
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: SummaryFieldObjectRole;
      execute_role: SummaryFieldObjectRole;
      project_admin_role: SummaryFieldObjectRole;
      inventory_admin_role: SummaryFieldObjectRole;
      credential_admin_role: SummaryFieldObjectRole;
      workflow_admin_role: SummaryFieldObjectRole;
      notification_admin_role: SummaryFieldObjectRole;
      job_template_admin_role: SummaryFieldObjectRole;
      execution_environment_admin_role: SummaryFieldObjectRole;
      auditor_role: SummaryFieldObjectRole;
      member_role: SummaryFieldObjectRole;
      read_role: SummaryFieldObjectRole;
      approval_role: SummaryFieldObjectRole;
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
      hosts: number;
    };
    default_environment: SummaryFieldsExecutionEnvironment;
  };
}

export type AwxOrganizationCreate = Omit<Organization, 'id' | 'summary_fields'>;
