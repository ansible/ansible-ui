// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// Serializer for the version information of Pulp components
export interface VersionResponse {
  // Name of a versioned component of Pulp
  component: string;

  // Version of the component (e.g. 3.0.0)
  version: string;

  // Python package name providing the component
  package: string;

  // Domain feature compatibility of component
  domain_compatible: boolean;
}
