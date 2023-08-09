// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// /api/pulp/api/v3/roles/{pulp_id}/
// Serializer for Role.
export interface RoleResponse {
  pulp_href: string;
  // Timestamp of creation.
  pulp_created: string;
  // The name of this role.
  name: string;
  // An optional description.
  description: string;
  // List of permissions defining the role.
  // True if the role is system managed.
  locked: boolean;
}
