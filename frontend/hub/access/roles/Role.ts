import { Role as GeneratedRole } from '../../interfaces/generated/Role';

export interface Role extends GeneratedRole {
  permissions: string[];
  pulp_created: string;
  pulp_href: string;
  locked: boolean;
}

export interface ModelPermissionsType {
  [key: string]: {
    global_description: string;
    has_model_permission: boolean;
    name: string;
    object_description: string;
    ui_category: string;
  };
}
