import { HubNamespace } from '../namespaces/HubNamespace';

import { CollectionVersionSearchListResponse as CollectionVersionSearch } from '../interfaces/generated/CollectionVersionSearchListResponse';
export { CollectionVersionSearch };

export interface Collection {
  id: number;
  name: string;
  description: string;
  version: string;
  sign_state: 'unsigned' | 'signed';
  deprecated: boolean;
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

export interface IContentsOption {
  name: string;
  type?: string;
  description: string | string[];
  choices?: string[];
  default?: (boolean | number | string) | string[];
  required?: boolean;
  aliases?: string[];
  elements?: string;
  suboptions?: IContentsOption[];
  env?: {
    name: string;
  }[];
  ini?: {
    key: string;
    section: string;
    default: string;
  }[];
  vars?: {
    name: string;
  }[];
  version_added?: string;
  version_added_collection?: string;
  cli?: {
    name: string;
  }[];
}

export type ISample =
  | (number | string)
  | ISample[]
  | {
      avg?: number;
      max?: number;
      min?: number;
      after?: string;
      before?: string;
    };

export interface IContents {
  doc_strings: null | {
    doc?: {
      notes?: string[];
      author: string | string[];
      module?: string;
      options?: IContentsOption[];
      filename: string;
      collection: string;
      has_action?: boolean;
      description: string[];
      version_added: string;
      short_description: string;
      version_added_collection: string;
      requirements?: string[];
      name?: string;
      deprecated?: { why: string; alternative: string };
    };
    return:
      | null
      | {
          name: string;
          type: string;
          sample?: ISample;
          returned: string;
          description: string;
          contains?: {
            name: string;
            type: string;
            description: string[];
          }[];
        }[];
    examples: null | string;
    metadata: null;
  };
  readme_file: null;
  readme_html: null;
  content_name: string;
  content_type: string;
}

export interface CollectionDocs {
  id: string;
  namespace: {
    pulp_href: string;
    id: number;
    name: string;
    company: string;
    email: string;
    avatar_url: string;
    description: string;
    groups: unknown[];
    related_fields: {
      my_permissions: string[];
    };
  };
  name: string;
  download_count: number;
  latest_version: {
    id: string;
    namespace: string;
    name: string;
    version: string;
    requires_ansible: string;
    created_at: string;
    metadata: {
      dependencies: {
        'ansible.utils': string;
      };
      contents: {
        name: string;
        description: null | string;
        content_type: string;
      }[];
      documentation: string;
      homepage: string;
      issues: string;
      repository: string;
      description: string;
      authors: string[];
      license: unknown[];
      tags: string[];
      signatures: unknown[];
    };
    contents: {
      name: string;
      content_type: string;
      description: null | string;
    }[];
    sign_state: string;
    docs_blob: {
      contents: IContents[];
      collection_readme: {
        html: string;
        name: string;
      };
      documentation_files: unknown[];
    };
  };
  all_versions: {
    id: string;
    version: string;
    created: string;
    sign_state: string;
  }[];
  sign_state: string;
}
export interface CollectionImport {
  created_at: string;
  finished_at: string;
  id: string;
  name: string;
  namespace: string;
  started_at: string;
  state: string;
  updated_at: string;
  version: string;
  error?: { traceback: string; description: string };
  messages?: { time: number; level: 'INFO' | 'WARNING' | 'ERROR'; message: string }[];
}
export interface CollectionReduced {
  id: number;
  name: string;
  description: string;
  version: string;
  namespace: string;
}
export interface CollectionVersion {
  pulp_href: string;
  pulp_created: string;
  number: number;
  repository: string;
  base_version: string;
  content_summary: {
    added: Record<string, { count: number }>;
    removed: Record<string, { count: number }>;
    present: Record<string, { count: number }>;
  };
}

/*
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
*/
