import {
  ColumnDashboardOption,
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { usePlatformRoleMetadata } from '@ansible/common-ui/access/components/usePlatformRoleMetadata';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useManagedRolesWithDescription } from '@ansible/hub-ui/access/roles/hooks/useManagedRolesWithDescription';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePermissionsComponentNames } from './usePermissionsComponentNames';
import { useGetResourceTypes } from './useResourceType';

// Define RolePermission type to match permission objects
interface RolePermission {
  api_slug: string;
  codename: string;
  name: string;
}

// Optionally, define RolePermissionsResponse if not already defined
interface RolePermissionsResponse {
  results: RolePermission[];
}

export function usePlatformRoleColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  disableExtraColumns?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const getDisplayName = useMapContentTypeToDisplayName();
  const platformRoleMetadata = usePlatformRoleMetadata();

  // Build a flat map of permission slug → display name from the metadata
  const metadataPermissionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const contentType of Object.values(platformRoleMetadata.content_types)) {
      for (const [slug, label] of Object.entries(contentType.permissions)) {
        // Only use labels that are actual display names (not raw slugs used as placeholders)
        if (label !== slug) {
          map[slug] = label;
        }
      }
    }
    return map;
  }, [platformRoleMetadata]);

  // Fetch role permissions to map permission codes to display names
  const { data: rolePermissionsResponse } = useGet<RolePermissionsResponse>(
    gatewayAPI`/service-index/role-permissions/?page_size=200`
  );

  // Create a map of permission codes to display names from API
  const apiPermissionMap = useMemo(() => {
    if (!rolePermissionsResponse?.results) {
      return {};
    }

    return Object.fromEntries(
      rolePermissionsResponse.results.map((permission: RolePermission) => [
        permission.api_slug,
        permission.name,
      ])
    ) as Record<string, string>;
  }, [rolePermissionsResponse]);

  // Function to get permission display names
  // Prefer metadata labels (used in the form) over API names for consistency
  const getPermissionDisplayNames = useCallback(
    (permissions: string[]) => {
      if (!permissions || !Array.isArray(permissions)) {
        return [];
      }

      return permissions.map((permissionCode) => {
        return (
          metadataPermissionMap[permissionCode] ||
          apiPermissionMap[permissionCode] ||
          permissionCode
        );
      });
    },
    [metadataPermissionMap, apiPermissionMap]
  );

  const nameColumn = useNameColumn<PlatformRole>({
    to: (role) => getPageUrl(PlatformRoute.RoleDetails, { params: { id: role.id } }),
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });

  const createdColumn = useCreatedColumn({
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });
  const modifiedColumn = useModifiedColumn({
    disableSort: options?.disableSort,
    disableLinks: options?.disableLinks,
  });

  const getPermissionsComponentNames = usePermissionsComponentNames();

  const { data: resourceTypeResponse } = useGetResourceTypes();

  const resourceModelMap = useMemo(
    () =>
      Object.fromEntries(
        resourceTypeResponse?.results?.map((rt) => [rt.api_slug, rt.model]) ?? []
      ) as Record<string, string>,
    [resourceTypeResponse]
  );
  const manageRoleWithDescription = useManagedRolesWithDescription();
  const isHubColumnWithNoDescription = (name: string, description: string) => {
    return name === description && name.startsWith('galaxy.');
  };
  return useMemo<ITableColumn<PlatformRole>[]>(
    () => [
      nameColumn,
      {
        id: 'description',
        header: t('Description'),
        type: 'description',
        value: (item) =>
          item?.name && isHubColumnWithNoDescription(item?.name, item?.description)
            ? (manageRoleWithDescription[item.name] ?? item.description)
            : item.description,
        list: 'description',
        card: 'description',
        modal: ColumnModalOption.hidden,
        dashboard: ColumnDashboardOption.hidden,
        detailsFullWidth: true,
      },
      {
        header: t('Components'),
        type: 'labels',
        value: (role) => getPermissionsComponentNames(role.permissions ?? []),
        modal: 'hidden',
      },
      {
        header: t('Resource type'),
        type: 'text',
        value: (role) =>
          getDisplayName(resourceModelMap[role.content_type ?? ''], { isTitleCase: true }) ??
          getDisplayName(role.content_type ?? '', { isTitleCase: true }),
        modal: 'hidden',
        table: options?.disableExtraColumns ? 'hidden' : undefined,
      },
      {
        header: t('Role creation'),
        type: 'text',
        value: (role) => (role.managed ? 'Default' : 'Custom'),
        modal: options?.disableExtraColumns ? 'hidden' : undefined,
        table: options?.disableExtraColumns ? 'hidden' : undefined,
      },
      {
        header: t('Permissions'),
        type: 'labels',
        value: (role) => getPermissionDisplayNames(role.permissions),
        sort: options?.disableSort ? undefined : 'permissions',
        modal: 'hidden',
        table: options?.disableExtraColumns ? 'hidden' : ColumnTableOption.expanded,
        detailsFullWidth: true,
      },
      createdColumn,
      modifiedColumn,
    ],
    [
      nameColumn,
      t,
      options?.disableExtraColumns,
      options?.disableSort,
      createdColumn,
      modifiedColumn,
      manageRoleWithDescription,
      getPermissionsComponentNames,
      getDisplayName,
      resourceModelMap,
      getPermissionDisplayNames,
    ]
  );
}
