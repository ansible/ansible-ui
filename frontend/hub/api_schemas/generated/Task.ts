// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
/*
Base serializer for use with :class:`pulpcore.app.models.Model`

This ensures that all Serializers provide values for the 'pulp_href` field.

The class provides a default for the ``ref_name`` attribute in the
ModelSerializers's ``Meta`` class. This ensures that the OpenAPI definitions
of plugins are namespaced properly.
*/
export interface Task {
  // The name of task.
  name: string;
  // The logging correlation id associated with this task
  logging_cid: string;
}
