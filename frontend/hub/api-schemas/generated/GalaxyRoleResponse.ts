// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// URL of interface:
// /pulp_ansible/galaxy/{path}/api/v1/roles/
// Part of response collection PulpItemsResponse

// A serializer for Galaxy's representation of Roles.
export interface GalaxyRoleResponse {
  // Get id.
  id: string;

  name: string;

  namespace: string;
}
