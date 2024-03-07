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
  groups: [
    {
      id: number;
      name: string;
      object_roles: string[];
    },
  ];
  related_fields: object;
  resources: string;
}
