export interface HubNamespaceGroup {
  id: number;
  name: string;
  object_roles: string[];
  pulp_href?: string;
}

export interface HubNamespaceUser {
  id?: number;
  /** User name - used by Insights/CRC API (GET response) */
  name?: string;
  /** Username - used by Platform API and Insights PUT payload */
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  groups?: { id: number; name: string }[];
  date_joined?: string;
  is_superuser?: boolean;
  auth_provider?: string[];
  object_roles: string[];
}

export interface HubNamespace {
  pulp_href: string;
  id: number;
  name: string;
  company: string;
  email: string;
  avatar_url: string;
  description: string;
  links: {
    name: string;
    url: string;
  }[];
  groups: HubNamespaceGroup[];
  users?: HubNamespaceUser[];
  related_fields: {
    my_permissions?: string[];
  };
  resources: string;
}
