export interface RemoteRegistry {
  id: string;
  pulp_href: string;
  name: string;
  url: string;
  policy: 'immediate';
  created_at: string;
  updated_at: string;
  tls_validation: boolean;
  client_cert: number | null;
  ca_cert: number | null;
  last_sync_task: {
    task_id: string;
    state: 'completed';
    started_at: string;
    finished_at: string;
    error: null;
  };
  download_concurrency: number | null;
  proxy_url: string | null;
  write_only_fields: {
    name:
      | 'client_key'
      | 'username'
      | 'password'
      | 'client_key'
      | 'proxy_username'
      | 'proxy_username';
    is_set: boolean;
  }[];
  rate_limit: null;
  is_indexable: boolean;
}
