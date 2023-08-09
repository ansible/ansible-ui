// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// Serializer for Domain.
export interface Domain {
  name: string;
  description: string;
  /*
	Backend storage class for domain.

* `pulpcore.app.models.storage.FileSystem` - Use local filesystem as storage
* `storages.backends.s3boto3.S3Boto3Storage` - Use Amazon S3 as storage
* `storages.backends.azure_storage.AzureStorage` - Use Azure Blob as storage
	*/
  // Settings for storage class.
  redirect_to_object_storage: boolean;
  hide_guarded_distributions: boolean;
}
