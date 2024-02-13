import { Group } from './generated-from-swagger/api';

export interface InventoryGroup extends Omit<Group, 'id' | 'name' | 'summary_fields' | 'related'> {
  id: number;
  name: string;
  created: string;
  modified: string;
  inventory: number;
  summary_fields: {
    groups: { results: never[]; count: number };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      copy: boolean;
    };
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
    created_by: {
      id: number;
      username: string;
    };
    modified_by: {
      id: number;
      username: string;
    };
  };
  related: {
    children: {
      count: number;
      results: Array<{ id: number; name: string }>;
    };
    hosts: {
      count: number;
      results: Array<{ id: number; name: string }>;
    };
  };
}

export interface InventoryGroupCreate {
  name: string;
  description: string;
  inventory: number;
  variables: string;
}

export interface InventoryGroupRelatedGroup {
  id: number;
}
