export type HubUser = {
  auth_provider: string[];
  date_joined: string;
  email: string;
  first_name: string;
  groups: HubUserGroup[];
  id: number;
  is_anonymous?: boolean;
  is_superuser: boolean;
  last_name: string;
  model_permissions?: HubUserPermissions;
  username: string;
  password?: string;
  resource: {
    ansible_id: string;
    resource_type: string;
  };
};

export type HubUserGroup = {
  id: number;
  name: string;
  object_roles?: string[];
};

type HubUserPermissions = {
  [key: string]: {
    global_description: string;
    has_model_permission: boolean;
    name: string;
    object_description: string;
    ui_category: string;
  };
};
