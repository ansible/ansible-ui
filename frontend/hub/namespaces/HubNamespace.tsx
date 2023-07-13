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
  task: string | null;
  groups: string[];
}

export interface HubNamespace {
  pulp_href: string;
  pulp_created: string;
  name: string;
  my_permissions: string[];
  latest_metadata: LatestMetadataType;
}
