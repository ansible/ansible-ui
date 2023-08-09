// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// A serializer for Git Collection Remotes.
export interface AnsibleGitRemote {
  sock_read_timeout: number;
  name: string;
  sock_connect_timeout: number;
  connect_timeout: number;
  tls_validation: boolean;
  download_concurrency: number;
  max_retries: number;
  ca_cert: string;
  url: string;
  password: string;
  username: string;
  client_key: string;
  proxy_username: string;
  // Headers for aiohttp.Clientsession
  client_cert: string;
  proxy_password: string;
  total_timeout: number;
  rate_limit: number;
  proxy_url: string;
  metadata_only: boolean;
  git_ref: string;
}
