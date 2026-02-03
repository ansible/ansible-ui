export interface HubNamespaceGroup {
  id: number;
  name: string;
  object_roles: string[];
}

export interface HubNamespaceUser {
  username: string;
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
