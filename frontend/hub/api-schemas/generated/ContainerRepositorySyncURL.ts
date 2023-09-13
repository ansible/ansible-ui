// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for Container Sync.
export interface ContainerRepositorySyncURL {
  // A remote to sync from. This will override a remote set on repository.
  remote: string;

  // If ``True``, synchronization will remove all content that is not present in the remote repository. If ``False``, sync will be additive only.
  mirror: boolean;

  // If ``True``, only signed content will be synced. Signatures are not verified.
  signed_only: boolean;
}
