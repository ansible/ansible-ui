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
