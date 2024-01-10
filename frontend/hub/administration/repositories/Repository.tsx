export interface Repository {
  description: string;
  gpgkey: null | string;
  last_sync_task: {
    error?: {
      description: string;
      traceback: string;
    };
    finished_at: string;
    started_at: string;
    state: string;
    task_id: string;
  };
  last_synced_metadata_time: null | string;
  latest_version_href: string;
  name: string;
  private: boolean;
  pulp_created: string;
  pulp_href: string;
  pulp_labels: Record<string, string>;
  remote: null | string;
  retain_repo_versions: null | number;
  versions_href: string;
}

export interface RepositoryVersion {
  pulp_href: string;
  pulp_created: string;
  number: number;
  repository: string;
  base_version: string;
}

export interface RemoteRepository {
  auth_url: string | null;
  ca_cert: string | null;
  pulclient_cert: string | null;
  created_at: string;
  download_concurrency: number | null;
  last_sync_task: {
    error?: {
      description: string;
      traceback: string;
    };
    finished_at: string;
    started_at: string;
    state: string;
    task_id: string;
  };
  name: string;
  pk: string;
  policy: string;
  proxy: string | null;
  proxy_username: string | null;
  pulp_href: string;
  rate_limit: number;
  repositories: {
    name: string;
    created_at: string;
    updated_at: string;
    description: string;
    next_version: number;
    distributions: {
      created_at: string;
      updated_at: string;
      base_path: string;
      content_guard: string;
      name: string;
    }[];
    last_sync_task: {
      error?: {
        description: string;
        traceback: string;
      };
      finished_at: string;
      started_at: string;
      state: string;
      task_id: string;
    };
  }[];

  requirements_file: string | null;
  signed_only: string | null;
  tls_validation: string | null;
  updated_at: string | null;
  url: string | null;
  usename: string | null;
}
