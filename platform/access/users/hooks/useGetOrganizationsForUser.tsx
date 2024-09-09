import { useCallback, useMemo } from 'react';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function useGetOrganizationsForUser(userId: number): {
  orgIds: number[]; // Array of organization IDs
  getAddedAndRemovedOrganizationIds: (newOrgIds: number[]) => {
    addedOrganizationIds: number[];
    removedOrganizationIds: number[];
  };
} {
  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayAPI`/users/${userId?.toString() ?? ''}/organizations/`
  );

  const orgIds = useMemo(
    () => organizationsData?.results?.map((organization) => organization.id),
    [organizationsData?.results]
  );

  const getAddedAndRemovedOrganizationIds = useCallback(
    (updatedOrgIds: number[]) => {
      const addedOrganizationIds: number[] = [];
      const removedOrganizationIds: number[] = [];
      if (!organizationsData?.results?.length) {
        addedOrganizationIds.push(...updatedOrgIds);
      } else {
        for (const updatedOrgId of updatedOrgIds) {
          if (
            !organizationsData?.results?.some((org) => org.id === updatedOrgId) &&
            !addedOrganizationIds?.some(
              (addedOrganizationId) => addedOrganizationId === updatedOrgId
            )
          ) {
            addedOrganizationIds.push(updatedOrgId);
          }
        }
        for (const organization of organizationsData.results) {
          if (
            !updatedOrgIds.some((updatedOrgId) => updatedOrgId === organization.id) &&
            !removedOrganizationIds.some(
              (removedOrganizationId) => removedOrganizationId === organization.id
            )
          ) {
            removedOrganizationIds.push(organization.id);
          }
        }
      }
      return {
        addedOrganizationIds,
        removedOrganizationIds,
      };
    },
    [organizationsData?.results]
  );

  return {
    orgIds: orgIds || [],
    getAddedAndRemovedOrganizationIds,
  };
}
