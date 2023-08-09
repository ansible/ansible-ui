// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// Serializer for FilesystemExports.
export interface FilesystemExport {
  // A URI of the task that ran the Export.
  task: string;
  // A URI of the publication to be exported.
  publication: string;
  // A URI of the repository version export.
  repository_version: string;
  // The URI of the last-exported-repo-version.
  start_repository_version: string;
}
