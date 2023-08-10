// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// URL of interface:
// /pulp_ansible/galaxy/default/api/v3/plugin/ansible/content/{distro_base_path}/namespaces/{name}/

// A serializer for Namespaces.
export interface AnsibleAnsibleNamespaceMetadataResponse {
  pulp_href: string;
  // Required named, only accepts lowercase, numbers and underscores.
  name: string;
  // Optional namespace company owner.
  company: string;
  // Optional namespace contact email.
  email: string;
  // Optional short description.
  description: string;
  // Optional resource page in markdown format.
  resources: string;
  // Labeled related links.
  links: unknown;
  // SHA256 digest of avatar image if present.
  avatar_sha256: string;
  // Download link for avatar image if present.
  avatar_url: string;
  metadata_sha256: string;
}
