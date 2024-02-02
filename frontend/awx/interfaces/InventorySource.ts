import { InventorySource as SwaggerInventorySource } from './generated-from-swagger/api';
import {
  SummaryFieldCredential,
  SummaryFieldsByUser,
  SummaryFieldsExecutionEnvironment,
} from './summary-fields/summary-fields';
export interface InventorySource
  extends Omit<
    SwaggerInventorySource,
    'id' | 'type' | 'name' | 'source' | 'inventory' | 'related' | 'summary_fields' | 'scm_branch'
  > {
  name: string;
  id: number;
  source: string;
  scm_branch: string;
  inventory: number;
  type: 'inventory_source';
  summary_fields: {
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    organization: { id: number; name: string; description: string };
    inventory: {
      name: string;
      description: string;
      has_active_failures: boolean;
      has_inventory_sources: boolean;
      hosts_with_active_failures: number;
      id: number;
      inventory_sources_with_failures: number;
      kind: string;
      organization_id: number;
      total_groups: number;
      total_hosts: number;
      total_inventory_sources: number;
    };
    user_capabilities: {
      edit: boolean;
      schedule: boolean;
      start: boolean;
      delete: boolean;
    };
    last_job: {
      description: string;
      failed: boolean;
      finished: string;
      id: number;
      license_error: boolean;
      name: string;
      status: string;
    };
    current_job: {
      description: string;
      failed: boolean;
      finished: string;
      id: number;
      license_error: boolean;
      name: string;
      status: string;
    };
    execution_environment: SummaryFieldsExecutionEnvironment;
    source_project: {
      name: string;
      id: number;
      description: string;
      scm_type: string;
      status: string;
    } | null;
    credential: SummaryFieldCredential;
  };
  related: { schedules: string };
}

export interface InventorySourceCreate {
  credential: number;
  inventory: number;
  source_path: string;
  source_script: string;
  execution_environment: SummaryFieldsExecutionEnvironment;
  description: string;
  name: string;
  overwrite: boolean;
  overwrite_vars: false;
  source: string;
  source_vars: string;
  scm_branch: string;
  update_cache_timeout: number;
  update_on_launch: boolean;
  verbosity: number;
  enabled_var: string;
  enabled_value: string;
  host_filter: string;
  source_project?: number;
}

export interface InventorySourceForm {
  credential: SummaryFieldCredential;
  inventory: number;
  source_path: { name: string };
  source_script: string;
  execution_environment: SummaryFieldsExecutionEnvironment;
  description: string;
  name: string;
  overwrite: boolean;
  overwrite_vars: false;
  source: string;
  source_vars: string;
  scm_branch: string;
  update_cache_timeout: number;
  update_on_launch: boolean;
  verbosity: number;
  enabled_var: string;
  enabled_value: string;
  host_filter: string;
  source_project: {
    name: string;
    id: number;
    description: string;
    scm_type: string;
    status: string;
  } | null;
}
