import { PageTable, useGetPageUrl, useInMemoryView } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamRolesColumns } from '../../teams/hooks/useTeamRolesColumns';

import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';

export function RoleFromName(name: string): PlatformRole | undefined {
  const { data, error } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: name,
    },
    { refreshInterval: 0 }
  );
  if (error) {
    return undefined;
  }
  return data?.results && data.results.length >= 0 ? data.results[0] : undefined;
}

// Extend the TeamAssignment interface to include intermediary_roles
interface ExtendedTeamAssignment extends TeamAssignment {
  intermediary_roles?: Array<{
    type: string;
    role_definition: {
      name: string;
      url: string;
    };
  }>;
}

interface ViewIndirectlyAssignedRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  username?: string;
  resourceId?: string;
  resourceType?: string;
  resourceName?: string;
  isManageResourceRoles?: boolean; // Optional prop to indicate if this is for managing resource roles
  userAnsibleId?: string; // New prop for user ansible ID
}

export function ViewIndirectlyAssignedRolesModal({
  isOpen,
  onClose,
  userId,
  username,
  resourceId,
  resourceType,
  isManageResourceRoles = false,
  userAnsibleId,
}: ViewIndirectlyAssignedRolesModalProps) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const actualUserId = userId || '';
  const baseTableColumns = useTeamRolesColumns();
  const tableColumns = useMemo(
    () => [
      ...baseTableColumns.map((column) => ({ ...column, sort: undefined })),
      {
        header: t('Inherited from'),
        cell: (resource) => {
          const teamName = resource.summary_fields?.team?.name;
          const teamId = resource.summary_fields?.team?.id;
          return (
            <Link to={getPageUrl(PlatformRoute.TeamDetails, { params: { id: teamId } })}>
              {teamName}
            </Link>
          );
        },
        sort: undefined,
      },
    ],
    [baseTableColumns, getPageUrl, t]
  );
  const tableColumnsManageResourceRoles = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (item: ExtendedTeamAssignment) => {
          const roleName = item.intermediary_roles?.[0]?.role_definition.name;
          const role = roleName ? RoleFromName(roleName) : undefined;
          return roleName ? (
            <Link
              to={getPageUrl(PlatformRoute.RoleDetails, {
                params: { id: role?.id },
              })}
            >
              {roleName}
            </Link>
          ) : (
            ''
          );
        },
        sort: undefined,
      },
      {
        header: t('Description'),
        cell: (item: ExtendedTeamAssignment) => {
          const roleName = item.intermediary_roles?.[0]?.role_definition.name;
          const role = roleName ? RoleFromName(roleName) : undefined;
          return role?.description;
        },
        sort: undefined,
      },
      {
        header: t('Inherited from'),
        cell: (item: ExtendedTeamAssignment) => {
          const contentObjectName = item.summary_fields?.content_object?.name;
          const contentObjectId = item.summary_fields?.content_object?.id;
          return contentObjectName ? (
            <Link to={getPageUrl(PlatformRoute.TeamDetails, { params: { id: contentObjectId } })}>
              {contentObjectName}
            </Link>
          ) : (
            ''
          );
        },
        sort: undefined,
      },
    ],
    [getPageUrl, t]
  );

  // Step 1: Get user's team memberships to find team IDs
  const { data: userTeamAssignments } = useGet<{
    results: Array<{ id: number; name: string }>;
  }>(isOpen ? gatewayAPI`/users/${actualUserId}/teams/` : undefined);

  // Step 2: Get team role assignments using the team IDs
  const teamIds = useMemo(() => {
    if (!userTeamAssignments?.results) return [];
    return userTeamAssignments.results.filter((team) => team.id).map((team) => team.id);
  }, [userTeamAssignments]);

  const teamIdsParam = teamIds.length > 0 ? teamIds.join(',') : '0';

  // Build query params based on whether this is for resource roles or general roles
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (teamIdsParam) {
      params.team__in = teamIdsParam;
    }

    if (isManageResourceRoles && resourceId && resourceType) {
      params.object_id = resourceId;
      params.content_type__api_slug = resourceType;
    }

    return params;
  }, [teamIdsParam, isManageResourceRoles, resourceId, resourceType]);

  const selectedTableColumns = isManageResourceRoles
    ? (tableColumnsManageResourceRoles as unknown as typeof tableColumns)
    : tableColumns;

  const roleUserRoleAccessURL = () => {
    const serviceTokens = resourceType?.split('.') || [];
    switch (serviceTokens[0]) {
      case 'awx':
        return awxAPI`/role_user_access/${resourceType ?? ''}/${resourceId ?? ''}/${userAnsibleId ?? ''}/`;
      case 'eda':
        return edaAPI`/role_user_access/${resourceType ?? ''}/${resourceId ?? ''}/${userAnsibleId ?? ''}/`;
      default:
        return gatewayAPI`/role_user_access/${resourceType ?? ''}/${resourceId ?? ''}/${userAnsibleId ?? ''}/`;
    }
  };
  const platformView = usePlatformView<TeamAssignment>({
    url: isManageResourceRoles ? roleUserRoleAccessURL() : gatewayAPI`/role_team_assignments/`,
    tableColumns: selectedTableColumns,
    queryParams: isManageResourceRoles
      ? { content_type__api_slug: 'shared.team' }
      : Object.keys(queryParams).length > 0
        ? queryParams
        : undefined,
    disableQueryString: true,
    defaultSort: undefined,
  });

  // Transform the data to flatten intermediary_roles into separate rows
  const flattenedItems = useMemo(() => {
    if (!isManageResourceRoles || !platformView.pageItems) {
      return platformView.pageItems;
    }

    const items: ExtendedTeamAssignment[] = [];
    let newItemCount = 0;

    platformView.pageItems.forEach((item: ExtendedTeamAssignment) => {
      if (item.intermediary_roles && item.intermediary_roles.length > 0) {
        // Create a separate row for each intermediary role
        item.intermediary_roles.forEach((intermediaryRole) => {
          items.push({
            ...item,
            id: item.id + newItemCount, // Ensure unique IDs
            intermediary_roles: [intermediaryRole], // Single role per row
          });
          newItemCount++;
        });
      } else {
        // Keep original item if no intermediary roles
        items.push(item);
      }
    });

    return items;
  }, [platformView.pageItems, isManageResourceRoles]);

  // Use standard in-memory view for transformed data when managing resource roles
  const inMemoryView = useInMemoryView<ExtendedTeamAssignment>({
    items: flattenedItems,
    tableColumns: selectedTableColumns,
    disableQueryString: true,
    keyFn: (item) => item.id,
  });

  // Use platform view for regular mode, in-memory view for resource roles mode
  const view = isManageResourceRoles ? inMemoryView : platformView;

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="indirect-roles-modal-title"
    >
      <ModalHeader
        title={t('Indirectly assigned roles for {{username}}', { username: username || 'user' })}
        labelId="indirect-roles-modal-title"
      />
      <ModalBody>
        <p>
          {t(
            "Below is a list of roles indirectly assigned to this user through a team assignment. To modify roles assigned to the user from a team assignment manage the team's assignments."
          )}
        </p>
        <PageTable<ExtendedTeamAssignment>
          {...view}
          tableColumns={selectedTableColumns}
          errorStateTitle={t('Error loading indirectly assigned roles')}
          emptyStateTitle={t('No indirectly assigned roles found.')}
          emptyStateDescription={t('This user has no roles inherited through team assignments.')}
          disableCardView
          disableListView
          compact
          disableLastRowBorder
          borderless
          autoHidePagination
        />
      </ModalBody>
      <ModalFooter>
        <Button variant={ButtonVariant.primary} onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
