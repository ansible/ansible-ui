// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
// Serializer for copying tags from a source repository to a destination repository.
export interface TagCopy {
  // A URI of the repository to copy content from.
  source_repository: string;
  // A URI of the repository version to copy content from.
  source_repository_version: string;
  // A list of tag names to copy.
}
