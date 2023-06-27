import { HubNamespace } from '../namespaces/HubNamespace';

export interface Collection {
  id: number;
  name: string;
  sign_state: 'unsigned' | 'signed';
  deprecates: boolean;
  download_count: number;
  namespace: HubNamespace;
  latest_version: {
    id: string;
    created_at: string;
    name: string;
    namespace: string;
    requires_ansible: string;
    sign_state: 'unsigned' | 'signed';
    version: string;
    authors: string[];
    metadata: {
      description: string;
      tags: string[];
      contents: {
        content_type: string;
      }[];
      dependencies: Record<string, string>;
      license: string[];
    };
  };
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

export interface ContentSummaryType {
  name: string;
  content_type: string;
  description: string;
}
