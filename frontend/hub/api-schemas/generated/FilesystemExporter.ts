// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for FilesystemExporters.
export interface FilesystemExporter {
  // Unique name of the file system exporter.
  name: string;
  // File system location to export to.
  path: string;
  /*
	Method of exporting

* `write` - Export by writing
* `hardlink` - Export by hardlinking
* `symlink` - Export by symlinking
	*/
  method: unknown;
}
