// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for Ansible Repositories.
export interface PatchedansibleAnsibleRepository {
  pulp_labels: unknown;
  // A unique name for this repository.
  name: string;
  // An optional description.
  description: string;
  // Retain X versions of the repository. Default is null which retains all versions.
  retain_repo_versions: number;
  // An optional remote to use by default when syncing.
  remote: string;
  // Last synced metadata time.
  last_synced_metadata_time: string;
  // Gpg public key to verify collection signatures against
  gpgkey: string;
  private: boolean;
}
