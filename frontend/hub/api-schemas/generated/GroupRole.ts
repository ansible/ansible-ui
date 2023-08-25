// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for GroupRole.
export interface GroupRole {
  role: string;
  // pulp_href of the object for which role permissions should be asserted. If set to 'null', permissions will act on the model-level.
  content_object: string;
  // Domain this role should be applied on, mutually exclusive with content_object.
  domain: string;
}
