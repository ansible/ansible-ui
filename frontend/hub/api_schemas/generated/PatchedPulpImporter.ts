// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for PulpImporters.
export interface PatchedPulpImporter {
  // Unique name of the Importer.
  name: string;
  // Mapping of repo names in an export file to the repo names in Pulp. For example, if the export has a repo named 'foo' and the repo to import content into was 'bar', the mapping would be "{'foo': 'bar'}".
  repo_mapping: unknown;
}
