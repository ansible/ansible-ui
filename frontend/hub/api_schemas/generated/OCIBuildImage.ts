// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
/*
Serializer for building an OCI container image from a Containerfile.

The Containerfile can either be specified via an artifact url, or a new file can be uploaded.
A repository must be specified, to which the container image content will be added.
*/
export interface OCIBuildImage {
  // Artifact representing the Containerfile that should be used to run podman-build.
  containerfile_artifact: string;
  // An uploaded Containerfile that should be used to run podman-build.
  containerfile: string;
  // A tag name for the new image being built.
  tag: string;
  // A JSON string where each key is an artifact href and the value is it's relative path (name) inside the /pulp_working_directory of the build container executing the Containerfile.
}
