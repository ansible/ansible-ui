// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// /api/pulp/api/v3/galaxy_ng/registry-remote/{pulp_id}/
/*
Every remote defined by a plugin should have a Remote serializer that inherits from this
class. Please import from `pulpcore.plugin.serializers` rather than from this module directly.
*/
export interface GalaxyContainerRegistryRemoteResponse {
  id: string;
  pulp_href: string;
  // A unique name for this remote.
  name: string;
  // The URL of an external content source.
  url: string;
  /*
	The policy to use when downloading content.

* `immediate` - immediate
* `When syncing, download all metadata and content now.` - When syncing, download all metadata and content now.
	*/
  created_at: string;
  updated_at: string;
  // If True, TLS peer validation must be performed.
  tls_validation: boolean;
  // A PEM encoded client certificate used for authentication.
  client_cert: string;
  // A PEM encoded CA certificate used to validate the server certificate presented by the remote server.
  ca_cert: string;
  last_sync_task: string;
  // Total number of simultaneous connections. If not set then the default value will be used.
  download_concurrency: number;
  // The proxy URL. Format: scheme://host:port
  proxy_url: string;
  // Limits requests per second for each concurrent downloader
  rate_limit: number;
  is_indexable: boolean;
}
