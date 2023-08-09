// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
/*
Serializer to add/remove object roles to/from users/groups.

This is used in conjunction with ``pulpcore.app.viewsets.base.RolesMixin`` and requires the
underlying object to be passed as ``content_object`` in the context.
*/
export interface NestedRoleResponse {
  role: string;
}
