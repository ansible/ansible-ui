// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// A serializer for Git Collection Remotes.
export interface AnsibleGitRemote {
  // aiohttp.ClientTimeout.sock_read (q.v.) for download-connections. The default is null, which will cause the default from the aiohttp library to be used.
  sock_read_timeout: number;
  // A unique name for this remote.
  name: string;
  // aiohttp.ClientTimeout.sock_connect (q.v.) for download-connections. The default is null, which will cause the default from the aiohttp library to be used.
  sock_connect_timeout: number;
  // aiohttp.ClientTimeout.connect (q.v.) for download-connections. The default is null, which will cause the default from the aiohttp library to be used.
  connect_timeout: number;
  // If True, TLS peer validation must be performed.
  tls_validation: boolean;
  // Total number of simultaneous connections. If not set then the default value will be used.
  download_concurrency: number;
  // Maximum number of retry attempts after a download failure. If not set then the default value (3) will be used.
  max_retries: number;
  // A PEM encoded CA certificate used to validate the server certificate presented by the remote server.
  ca_cert: string;
  // The URL of an external content source.
  url: string;
  // The password to be used for authentication when syncing. Extra leading and trailing whitespace characters are not trimmed.
  password: string;
  // The username to be used for authentication when syncing.
  username: string;
  // A PEM encoded private key used for authentication.
  client_key: string;
  // The username to authenticte to the proxy.
  proxy_username: string;
  // Headers for aiohttp.Clientsession
  // A PEM encoded client certificate used for authentication.
  client_cert: string;
  // The password to authenticate to the proxy. Extra leading and trailing whitespace characters are not trimmed.
  proxy_password: string;
  // aiohttp.ClientTimeout.total (q.v.) for download-connections. The default is null, which will cause the default from the aiohttp library to be used.
  total_timeout: number;
  // Limits requests per second for each concurrent downloader
  rate_limit: number;
  // The proxy URL. Format: scheme://host:port
  proxy_url: string;
  // If True, only metadata about the content will be stored in Pulp. Clients will retrieve content from the remote URL.
  metadata_only: boolean;
  // A git ref. e.g.: branch, tag, or commit sha.
  git_ref: string;
}
