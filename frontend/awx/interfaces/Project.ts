import { Project as SwaggerProject } from './generated-from-swagger/api';
import {
  SummaryFieldCredential,
  SummaryFieldJob,
  SummaryFieldsByUser,
  SummaryFieldsExecutionEnvironment,
  SummaryFieldsOrganization,
} from './summary-fields/summary-fields';

export interface Project
  extends Omit<SwaggerProject, 'summary_fields' | 'related' | 'id' | 'name' | 'scm_type'> {
  id: number;
  name: string;
  base_dir: string;
  scm_type: '' | 'manual' | 'git' | 'svn' | 'insights' | 'archive' | null;
  summary_fields: {
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    credential: SummaryFieldCredential;
    organization: SummaryFieldsOrganization;
    signature_validation_credential: SummaryFieldCredential;
    default_environment: SummaryFieldsExecutionEnvironment;
    current_job: SummaryFieldJob;
    last_job: SummaryFieldJob;
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      start: boolean;
      schedule: boolean;
      copy: boolean;
    };
    current_update: {
      id: number;
    };
  };
  related: {
    created_by: string;
    modified_by: string;
    teams: string;
    playbooks: string;
    inventory_files: string;
    update: string;
    project_updates: string;
    scm_inventory_sources: string;
    schedules: string;
    activity_stream: string;
    notification_templates_started: string;
    notification_templates_success: string;
    notification_templates_error: string;
    access_list: string;
    object_roles: string;
    copy: string;
    organization: string;
    last_job?: string;
    last_update?: string;
  };
}

export type SCMType = '' | 'git' | 'svn' | 'insights' | 'archive' | null;

export type AwxProjectCreate = Omit<Project, 'id' | 'summary_fields' | 'related'>;
