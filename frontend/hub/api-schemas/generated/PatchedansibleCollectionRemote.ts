// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// A serializer for Collection Remotes.
export interface PatchedansibleCollectionRemote {
  // The URL of an external content source.
  url: string;

  // The URL to receive a session token from, e.g. used with Automation Hub.
  auth_url: string;

  token: string;

  /*
	The policy to use when downloading content.

* `immediate` - immediate
* `When syncing, download all metadata and content now.` - When syncing, download all metadata and content now.
	*/
  // policy				:	unknown;

  // The string version of Collection requirements yaml.
  requirements_file: string;

  created_at: string;

  updated_at: string;

  // Remote user.
  username: string;

  // Remote password.
  password: string;

  // If True, TLS peer validation must be performed.
  tls_validation: boolean;

  // A PEM encoded private key used for authentication.
  client_key: string;

  // A PEM encoded client certificate used for authentication.
  client_cert: string;

  // A PEM encoded CA certificate used to validate the server certificate presented by the remote server.
  ca_cert: string;

  // Total number of simultaneous connections. If not set then the default value will be used.
  download_concurrency: number;

  // The proxy URL. Format: scheme://host:port
  proxy_url: string;

  // User for proxy authentication.
  proxy_username: string;

  // Password for proxy authentication.
  proxy_password: string;

  // Limits requests per second for each concurrent downloader
  rate_limit: number;

  // Sync only collections that have a signature
  signed_only: boolean;
}
