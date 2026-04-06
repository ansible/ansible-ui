import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useMemo } from 'react';
import {
  ALLOWED_EDA_TYPES,
  ALLOWED_GALAXY_TYPES,
  EXCLUDED_SERVICES,
  SERVICE_DISPLAY_NAMES,
  ServiceType,
} from '../../teams/constants/resourceTypeConstants';

export interface RoleTypeResult {
  api_slug: string;
  service: string;
  app_label: string;
  model: string;
  parent_content_type: string | null;
  pk_field_type: string;
}

export interface ResourceTypeOption {
  value: string;
  label: string;
  group: string;
  description?: string;
}

const isKnownService = (service: string): service is ServiceType => {
  return service in SERVICE_DISPLAY_NAMES;
};

const getServiceDisplayName = (service: string): string => {
  return isKnownService(service) ? SERVICE_DISPLAY_NAMES[service] : service;
};

const isAllowedRoleType = (roleType: RoleTypeResult): boolean => {
  // Exclude specified services
  if (EXCLUDED_SERVICES.some((excludedService) => excludedService === roleType.service)) {
    return false;
  }

  // For the eda service, only include specific allowed types
  if (roleType.service === 'eda') {
    return ALLOWED_EDA_TYPES.some((allowedType) => allowedType === roleType.api_slug);
  }

  // For galaxy service, only include specific allowed types
  if (roleType.service === 'galaxy') {
    return ALLOWED_GALAXY_TYPES.some((allowedType) => allowedType === roleType.api_slug);
  }

  return true;
};

export function useResourceTypeOptions() {
  const {
    data: roleTypes,
    isLoading,
    error,
  } = useGet<PlatformItemsResponse<RoleTypeResult>>(gatewayAPI`/service-index/role-types/`);
  const mapContentTypeToDisplayName = useMapContentTypeToDisplayName();

  const options = useMemo((): ResourceTypeOption[] => {
    if (!roleTypes?.results) {
      return [];
    }

    const apiOptions = roleTypes.results.filter(isAllowedRoleType).map((roleType) => ({
      value: roleType.api_slug,
      label: mapContentTypeToDisplayName(roleType.model, { isTitleCase: true }),
      group: getServiceDisplayName(roleType.service),
    }));

    // Add hardcoded "System" option under Automation Content group
    // The backend does not include system roles in the role-types endpoint
    // because system roles have content_type=null which the api_slug CharField cannot represent
    apiOptions.push({
      value: 'system',
      label: mapContentTypeToDisplayName('system', { isTitleCase: true }),
      group: getServiceDisplayName('galaxy'),
    });

    return apiOptions.sort((a, b) => a.label.localeCompare(b.label));
  }, [roleTypes?.results, mapContentTypeToDisplayName]);

  return {
    options,
    isLoading,
    error,
  };
}
