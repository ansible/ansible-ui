// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// /pulp_ansible/galaxy/default/api/v3/plugin/ansible/content/{distro_base_path}/collections/index/{namespace}/{name}/versions/{version}/
// A serializer for a CollectionVersion.
export interface CollectionVersionResponse {
  version: string;
  href: string;
  created_at: string;
  updated_at: string;
  requires_ansible: string;
  // Get a list of mark values filtering only those in the current repo.
  download_url: string;
  name: string;
  signatures: string;
  git_url: string;
  git_commit_sha: string;
  // A JSON field holding MANIFEST.json data.
  // A JSON field holding FILES.json data.
}
