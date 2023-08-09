import { ContainerNamespaceResponse } from './index';
// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// /api/pulp/api/v3/galaxy_ng/container-distribution-proxy/{pulp_id}/
export interface ContainerRepositoryResponse {
  id: string;
  pulp_href: string;
  name: string;
  namespace: ContainerNamespaceResponse;
  description: string;
  created_at: string;
  updated_at: string;
}
