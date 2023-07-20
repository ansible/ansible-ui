export interface HubNamespaceMetadata {
  metadata: {
    pulp_href: string;
    name: string;
    company: string;
    email: string;
    description: string;
    resources: string;
    links: string[];
    avatar_sha256: null;
    avatar_url: null;
    metadata_sha256: string;
    groups: [];
    task: null;
  };
  repository: {
    pulp_href: string;
    pulp_created: string;
    versions_href: string;
    pulp_labels: {
      pipeline: string;
    };
    latest_version_href: string;
    name: string;
    description: string;
    retain_repo_versions: number;
    remote: null;
  };
  in_latest_repo_version: true;
  in_old_repo_version: false;
}
