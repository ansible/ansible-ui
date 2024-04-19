import { Inventory as SwaggerInventory } from './generated-from-swagger/api';
import {
  SummaryFieldsByUser,
  SummaryFieldsOrganization,
  SummaryFieldObjectRole,
} from './summary-fields/summary-fields';
import { Label } from './Label';

export interface CommonInventory
  extends Omit<
    SwaggerInventory,
    'id' | 'name' | 'type' | 'kind' | 'summary_fields' | 'organization'
  > {
  id: number;
  name: string;
  type: 'inventory';
  summary_fields: {
    organization: SummaryFieldsOrganization;
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: SummaryFieldObjectRole;
      update_role: SummaryFieldObjectRole;
      adhoc_role: SummaryFieldObjectRole;
      use_role: SummaryFieldObjectRole;
      read_role: SummaryFieldObjectRole;
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
  organization: number;
  has_inventory_sources: boolean;
  inventory_sources_with_failures: number;
  pending_deletion: boolean;
  total_inventory_sources: number;
  variables: string;
}

export interface ConstructedInventory extends CommonInventory {
  kind: 'constructed';
  source_vars: string;
  update_cache_timeout: number;
  limit: string;
  verbosity: number;
}

export interface RegularInventory extends CommonInventory {
  kind: '';
  verbosity?: never;
}

export interface SmartInventory extends CommonInventory {
  kind: 'smart';
  verbosity?: never;
}

export type Inventory = RegularInventory | ConstructedInventory | SmartInventory;

export interface RunCommandWizard {
  module: string;
  module_args: string;
  verbosity: number;
  limit: string;
  forks: boolean;
  diff_mode: boolean;
  become_enabled: boolean;
  extra_vars: string;
  credential: { name: string };
  credentialIdPath: string;
  execution_environment: { name: string; id: string };
}
