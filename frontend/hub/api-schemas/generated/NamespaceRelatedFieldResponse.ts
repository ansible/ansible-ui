// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

/*
Serializer only returns fields specified in 'include_related' query param.

This allows for fields that require more database queries to be optionally
included in API responses, which lowers the load on the backend. This is
intended as a way to include extra data in list views.

Usage:

This functions the same as DRF's base `serializers.Serializer` class with the
exception that it will only return fields specified in the `?include_related=`
query parameter.

Example:

MySerializer(RelatedFieldsBaseSerializer):
    foo = CharField()
    bar = CharField()

MySerializer will return:

{"foo": None} when called with `?include_related=foo` and {"foo": None, "bar" None}
when called with `?include_related=foo&include_related=bar`.
*/
export interface NamespaceRelatedFieldResponse {
  my_permissions: unknown;
}
