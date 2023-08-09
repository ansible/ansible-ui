// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// Serializer for call to import into Pulp.
export interface PulpImport {
  // Path to export that will be imported.
  path: string;
  // Path to a table-of-contents file describing chunks to be validated, reassembled, and imported.
  toc: string;
  // If True, missing repositories will be automatically created during the import.
  create_repositories: boolean;
}
