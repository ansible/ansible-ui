// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
/*
Check validity of provided import-options.

Provides the ability to check that an import is 'sane' without having to actually
create an importer.
*/
export interface PulpImportCheck {
  // Path to export-tar-gz that will be imported.
  path: string;
  // Path to a table-of-contents file describing chunks to be validated, reassembled, and imported.
  toc: string;
  // Mapping of repo names in an export file to the repo names in Pulp. For example, if the export has a repo named 'foo' and the repo to import content into was 'bar', the mapping would be "{'foo': 'bar'}".
  repo_mapping: string;
}
