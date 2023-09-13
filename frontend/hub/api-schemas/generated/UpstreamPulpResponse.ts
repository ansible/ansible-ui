// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// URL of interface:
// /api/pulp/api/v3/upstream-pulps/{pulp_id}/

// Serializer for a Server.
export interface UpstreamPulpResponse {
  pulp_href: string;

  // Timestamp of creation.
  pulp_created: string;

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

  // If True, TLS peer validation must be performed.
  tls_validation: boolean;

  // Timestamp of the most recent update of the remote.
  pulp_last_updated: string;

  // List of hidden (write only) fields
  // hidden_fields				:	unknown;

  // One or more comma separated labels that will be used to filter distributions on the upstream Pulp. E.g. "foo=bar,key=val" or "foo,key"
  pulp_label_select: string;
}
