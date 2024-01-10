// URL of interface:
// /api/pulp/api/v3/repositories/
// Part of response collection PulpItemsResponse

import './../generated/RepositoryResponse';

declare module './../generated/RepositoryResponse' {
  interface RepositoryResponse {
    pulp_labels?: {
      pipeline?: string;
    };
    pulp_href: string;
    latest_version_href: string;
  }
}
