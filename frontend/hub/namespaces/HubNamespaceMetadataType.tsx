export interface Metadata {
  pulp_href: string;
  name: string;
  company?: string;
  email?: string;
  description?: string;
  resources?: string;
  links: [];
  avatar_sha256: null | string;
  avatar_url: null | string;
  metadata_sha256: string;
  groups: [];
  task: string | null;
}

export interface Repository {
  pulp_href: string;
  pulp_created: string;
  versions_href: string;
  pulp_labels: { pipeline: string };
  latest_version_href: string;
  name: string;
  description: string;
  retain_repo_versions: number;
  remote: null | string;
}

export interface HubNamespaceMetadataType {
  metadata: Metadata;
  repository: Repository;
  in_latest_repo_version: boolean;
  in_old_repo_version: boolean;
}
