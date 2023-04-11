import { Inventory as SwaggerInventory } from './generated-from-swagger/api';
import {
  SummaryFieldsByUser,
  SummaryFieldsOrganization,
  SummeryFieldObjectRole,
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
      admin_role: SummeryFieldObjectRole;
      update_role: SummeryFieldObjectRole;
      adhoc_role: SummeryFieldObjectRole;
      use_role: SummeryFieldObjectRole;
      read_role: SummeryFieldObjectRole;
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
