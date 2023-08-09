// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// Serializer for a Server.
export interface PatchedUpstreamPulp {
  // A unique name for this Pulp server.
  name: string;
  // The transport, hostname, and an optional port of the Pulp server. e.g. https://example.com
  base_url: string;
  // The API root. Defaults to '/pulp/'.
  api_root: string;
  // The domain of the Pulp server if enabled.
  domain: string;
  // A PEM encoded CA certificate used to validate the server certificate presented by the remote server.
  ca_cert: string;
  // A PEM encoded client certificate used for authentication.
  client_cert: string;
  // A PEM encoded private key used for authentication.
  client_key: string;
  // If True, TLS peer validation must be performed.
  tls_validation: boolean;
  // The username to be used for authentication when syncing.
  username: string;
  // The password to be used for authentication when syncing. Extra leading and trailing whitespace characters are not trimmed.
  password: string;
  // One or more comma separated labels that will be used to filter distributions on the upstream Pulp. E.g. "foo=bar,key=val" or "foo,key"
  pulp_label_select: string;
}
