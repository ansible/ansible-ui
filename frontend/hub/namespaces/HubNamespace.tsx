export interface HubNamespace {
  pulp_href: string;
  id: number;
  name: string;
  company: string;
  email: string;
  avatar_url: string;
  description: string;
  groups: [
    {
      id: number;
      name: string;
      object_roles: string[];
    },
  ];
  users: [
    {
      id: number;
      name: string;
      object_roles: string[];
    },
  ];
  related_fields: {
    my_permissions?: string[];
  };
}
