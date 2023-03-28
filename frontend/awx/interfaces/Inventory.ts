import { SummaryFieldsByUser, SummaryFieldsOrganization } from './summary-fields/summary-fields';
import { Label } from './Label';

export interface Inventory {
  id: number;
  type: string;
  url: string;
  related: {
    created_by: string;
    modified_by: string;
    hosts: string;
    groups: string;
    root_groups: string;
    variable_data: string;
    script: string;
    tree: string;
    inventory_sources: string;
    update_inventory_sources: string;
    activity_stream: string;
    job_templates: string;
    ad_hoc_commands: string;
    access_list: string;
    object_roles: string;
    instance_groups: string;
    copy: string;
    labels: string;
    organization: string;
  };
  summary_fields: {
    organization: SummaryFieldsOrganization;
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number };
      read_role: { id: number };
      use_role: { id: number };
      update_role: { id: number };
      adhoc_role: { id: number };
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      copy: boolean;
      adhoc: boolean;
    };
    labels: {
      count: number;
      results: Label[];
    };
  };
  created: string;
  modified: string;
  name: string;
  description: string | null;
  organization: number;
  kind: '' | 'smart' | 'constructed';
  host_filter: string | null;
  variables: string | null;
  has_active_failures: boolean;
  total_hosts: number;
  hosts_with_active_failures: number;
  total_groups: number;
  has_inventory_sources: boolean;
  total_inventory_sources: number;
  inventory_sources_with_failures: number;
  pending_deletion: boolean;
  prevent_instance_group_fallback: boolean | null;
  source_vars?: string;
  update_cache_timeout?: number;
  limit?: string;
  verbosity?: number;
}
