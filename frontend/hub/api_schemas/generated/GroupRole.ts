// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// Serializer for GroupRole.
export interface GroupRole {
  role: string;
  // pulp_href of the object for which role permissions should be asserted. If set to 'null', permissions will act on the model-level.
  content_object: string;
  // Domain this role should be applied on, mutually exclusive with content_object.
  domain: string;
}
