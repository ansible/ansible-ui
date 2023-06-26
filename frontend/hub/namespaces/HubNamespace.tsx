export interface LinksType {
  name: string;
  url: string;
}

export interface LatestMetadataType {
  pulp_href: string;
  name: string;
  company: string;
  email: string;
  description: string;
  resources: string;
  links: LinksType[];
  avatar_sha256: string | null;
  avatar_url: string | null;
  metadata_sha256: string;
  groups: string[];
  task: string | null;
}

export interface HubNamespace {
  pulp_href: string;
  pulp_created: string;
  id: number;
  name: string;
  company: string;
  email: string;
  avatar_url: string;
  description: string;
  num_collections: number;
  groups: [
    {
      id: number;
      name: string;
      object_permissions: string[];
      pulp_href?: string;
    }
  ];
  resources: string;
  owners: string[];
  links: LinksType[];
  my_permissions: string[];
  latest_metadata: LatestMetadataType;
}
