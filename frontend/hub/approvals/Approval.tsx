/*export interface Approval {
  id: string;
  namespace: string;
  name: string;
  version: string;
  requires_ansible: string;
  created_at: string;
  metadata: {
    dependencies: { string: string };
    contents: { name: string; description: string; content_type: string }[];
    documentation: string;
    homepage: string;
    issues: string;
    repository: string;
    description: string;
    authors: string[];
    license: string[];
    tags: string[];
    signatures: string[];
  };
  contents: [{ name: string; content_type: string; description: string }];
  sign_state: 'unsigned' | 'signed';
  repository_list: ('staging' | 'published')[];
}*/

export interface ContentSummaryType {
  name: string;
  content_type: string;
  description: string;
}

export interface CollectionVersionSearch {
  collection_version: {
    contents: ContentSummaryType[];
    dependencies: {
      [collection: string]: string;
    };
    description: string;
    name: string;
    namespace: string;
    pulp_created: string;
    pulp_href: string;
    require_ansible: string;
    tags: {
      name: string;
    }[];
    version: string;
  };
  is_deprecated: boolean;
  is_highest: boolean;
  is_signed: boolean;
  // TODO: ansible namespace metadata doesn't work yet
  // assuming fields from pulp_ansible/NamespaceSummarySerializer
  namespace_metadata?: {
    pulp_href: string;
    name: string;
    company: string;
    description: string;
    avatar_url: string;
  };
  repository: {
    description: string;
    latest_version_href: string;
    name: string;
    pulp_created: string;
    pulp_href: string;
    pulp_labels: {
      pipeline?: string;
    };
    remote?: string;
    retain_repo_versions: number;
    versions_href: string;
  };
  repository_version: string;
}
