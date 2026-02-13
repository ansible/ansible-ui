/**
 * InsightsAccessTab - Shared access tab component for Insights/CRC mode
 *
 * This component provides full access management functionality:
 * - Users section with "Select a user" button and remove user option
 * - Groups section with "Select a group" button and remove group option
 * - Click on user/group to view and manage their roles
 * - Add/remove roles functionality
 *
 * This is a generic component used by:
 * - Namespaces (embedded data pattern)
 * - Repositories (Pulp RBAC pattern)
 * - Remotes (Pulp RBAC pattern)
 * - Execution Environments (Pulp RBAC pattern)
 */
import {
  Alert,
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { InsightsSelectUser, InsightsApiUser } from './InsightsSelectUser';
import { InsightsSelectGroup } from './InsightsSelectGroup';
import { InsightsSelectRoles, Role } from './InsightsSelectRoles';
import { useManagedRolesWithDescription } from '../../access/roles/hooks/useManagedRolesWithDescription';
import { useHubContext } from '../useHubContext';
import { pulpAPI } from '../api/formatPath';
import { getHubRequest } from '../api/request';

/**
 * Generic user interface - supports both 'name' (Insights) and 'username' (Pulp RBAC) patterns
 */
export interface InsightsAccessUser {
  /** User name - used by Insights/CRC API (namespaces) */
  name?: string;
  /** Username - used by Pulp RBAC API (repositories, remotes) */
  username?: string;
  /** Assigned roles */
  object_roles: string[];
}

/**
 * Generic group interface
 */
export interface InsightsAccessGroup {
  id?: number;
  name: string;
  object_roles: string[];
  pulp_href?: string;
}

export interface InsightsAccessTabProps {
  /** Resource name for display in modals */
  resourceName: string;
  /** Users with their assigned roles */
  users: InsightsAccessUser[];
  /** Groups with their assigned roles */
  groups: InsightsAccessGroup[];
  /** Whether the current user can edit owners */
  canEditOwners: boolean;
  /** Pulp object type for role filtering (e.g., 'pulp_ansible/namespaces', 'repositories/ansible/ansible') */
  pulpObjectType: string;
  /** Message to display in role selection wizard */
  selectRolesMessage?: string;
  /** Callback to add a user with roles - receives the full API user object */
  onAddUser: (user: InsightsApiUser, roles: string[]) => Promise<void>;
  /** Callback to remove a user */
  onRemoveUser: (user: InsightsAccessUser) => Promise<void>;
  /** Callback to add roles to a user */
  onAddUserRoles: (user: InsightsAccessUser, roles: string[]) => Promise<void>;
  /** Callback to remove a role from a user */
  onRemoveUserRole: (user: InsightsAccessUser, role: string) => Promise<void>;
  /** Callback to add a group with roles */
  onAddGroup: (
    group: { id?: number; name: string; pulp_href?: string },
    roles: string[]
  ) => Promise<void>;
  /** Callback to remove a group */
  onRemoveGroup: (group: InsightsAccessGroup) => Promise<void>;
  /** Callback to add roles to a group */
  onAddGroupRoles: (group: InsightsAccessGroup, roles: string[]) => Promise<void>;
  /** Callback to remove a role from a group */
  onRemoveGroupRole: (group: InsightsAccessGroup, role: string) => Promise<void>;
}

const SectionSeparator = () => (
  <div
    style={{
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      height: '16px',
      margin: '24px -24px',
    }}
  />
);

/**
 * Component to render a single permission group row in the description list
 * Extracted to reduce function nesting depth
 */
interface PermissionGroupRowProps {
  contentType: string;
  displayName: string;
  permissions: string[];
  getPermissionLabel: (permission: string) => string;
}

function PermissionGroupRow({
  contentType,
  displayName,
  permissions,
  getPermissionLabel,
}: Readonly<PermissionGroupRowProps>) {
  return (
    <DescriptionListGroup key={contentType}>
      <DescriptionListTerm style={{ fontWeight: 'normal' }}>{displayName}</DescriptionListTerm>
      <DescriptionListDescription>
        <LabelGroup numLabels={10}>
          {permissions.map((perm) => (
            <Label key={perm}>{getPermissionLabel(perm)}</Label>
          ))}
        </LabelGroup>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}

/**
 * Kebab dropdown component to avoid inline component definitions and reduce nesting
 */
interface KebabDropdownProps {
  itemKey: string;
  openKebab: string | null;
  setOpenKebab: (key: string | null) => void;
  ariaLabel: string;
  onRemove: () => void;
  removeLabel: string;
}

function KebabDropdown({
  itemKey,
  openKebab,
  setOpenKebab,
  ariaLabel,
  onRemove,
  removeLabel,
}: Readonly<KebabDropdownProps>) {
  const isOpen = openKebab === itemKey;
  const handleToggleClick = useCallback(
    () => setOpenKebab(isOpen ? null : itemKey),
    [setOpenKebab, isOpen, itemKey]
  );
  const handleSelect = useCallback(() => setOpenKebab(null), [setOpenKebab]);
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setOpenKebab(null);
    },
    [setOpenKebab]
  );
  const handleRemoveClick = useCallback(() => {
    onRemove();
    setOpenKebab(null);
  }, [onRemove, setOpenKebab]);

  const renderToggle = useCallback(
    (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        variant="plain"
        onClick={handleToggleClick}
        isExpanded={isOpen}
        aria-label={ariaLabel}
      >
        <EllipsisVIcon />
      </MenuToggle>
    ),
    [handleToggleClick, isOpen, ariaLabel]
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={handleSelect}
      onOpenChange={handleOpenChange}
      toggle={renderToggle}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem key="remove" onClick={handleRemoveClick}>
          {removeLabel}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}

/**
 * Helper to get user display name - supports both 'name' and 'username' patterns
 */
const getUserName = (user: InsightsAccessUser): string => user.name || user.username || '';

/**
 * Helper to format a permission string as "Category: permission"
 * e.g., "galaxy.change_namespace" -> "Galaxy: change_namespace"
 */
const formatPermission = (permission: string) => {
  const [category, ...rest] = permission.split('.');
  const permissionName = rest.join('.');
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <>
      <strong>{categoryTitle}:</strong> {permissionName}
    </>
  );
};

/**
 * Interface for role details returned by the Pulp roles API
 */
interface RoleDetails {
  name: string;
  description?: string;
  permissions?: string[];
  pulp_href?: string;
}

interface RolesResponse {
  count: number;
  results: RoleDetails[];
}

export function InsightsAccessTab({
  resourceName,
  users,
  groups,
  canEditOwners,
  pulpObjectType,
  selectRolesMessage,
  onAddUser,
  onRemoveUser,
  onAddUserRoles,
  onRemoveUserRole,
  onAddGroup,
  onRemoveGroup,
  onAddGroupRoles,
  onRemoveGroupRole,
}: Readonly<InsightsAccessTabProps>) {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Use current path for links to stay on access tab
  const basePath = location.pathname;

  // Role descriptions hook
  const managedRolesWithDescription = useManagedRolesWithDescription();
  // Get model_permissions from user context for permission labels and categories
  const { user } = useHubContext();
  const modelPermissions = user?.model_permissions;

  // Wizard states
  const [showUserWizard, setShowUserWizard] = useState(false);
  const [showGroupWizard, setShowGroupWizard] = useState(false);
  const [showRoleWizard, setShowRoleWizard] = useState(false);

  // Selected items for wizards
  const [selectedUser, setSelectedUser] = useState<InsightsApiUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    id?: number;
    name: string;
    pulp_href?: string;
  } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  // Delete confirmation modals
  const [userToRemove, setUserToRemove] = useState<InsightsAccessUser | null>(null);
  const [groupToRemove, setGroupToRemove] = useState<InsightsAccessGroup | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<{
    role: string;
    target: 'user' | 'group';
  } | null>(null);

  // Kebab menu states
  const [openKebab, setOpenKebab] = useState<string | null>(null);

  // Operation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expanded rows state for role details view
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [roleDetails, setRoleDetails] = useState<Record<string, RoleDetails>>({});
  const [roleDetailsLoading, setRoleDetailsLoading] = useState<Record<string, boolean>>({});

  // Current view: user detail, group detail, or main view
  const selectedUserParam = searchParams.get('user');
  const selectedGroupParam = searchParams.get('group');

  const currentUser = selectedUserParam
    ? users.find((u) => getUserName(u) === selectedUserParam)
    : null;
  const currentGroup = selectedGroupParam
    ? groups.find((g) => g.name === selectedGroupParam)
    : null;

  // Fetch role details when a role is expanded
  const fetchRoleDetails = useCallback(
    async (roleName: string) => {
      if (roleDetails[roleName] || roleDetailsLoading[roleName]) return;

      setRoleDetailsLoading((prev) => ({ ...prev, [roleName]: true }));

      try {
        const url = pulpAPI`/roles/?name=${encodeURIComponent(roleName)}`;
        const { response } = await getHubRequest<RolesResponse>(url);
        // Type narrow: RolesResponse has 'results' property
        if (response && 'results' in response && response.results.length > 0) {
          setRoleDetails((prev) => ({ ...prev, [roleName]: response.results[0] }));
        }
      } catch {
        // Silently fail - we'll show the role without permissions
      } finally {
        setRoleDetailsLoading((prev) => ({ ...prev, [roleName]: false }));
      }
    },
    [roleDetails, roleDetailsLoading]
  );

  // Handle role row expansion toggle
  const handleRoleExpand = useCallback(
    (roleName: string) => {
      const isExpanding = !expandedRoles[roleName];
      setExpandedRoles((prev) => ({ ...prev, [roleName]: isExpanding }));
      if (isExpanding) {
        fetchRoleDetails(roleName).catch(() => {
          // Error handling is done within fetchRoleDetails
        });
      }
    },
    [expandedRoles, fetchRoleDetails]
  );

  /**
   * Get human-readable permission label from model_permissions or format from string.
   * Matches ansible-hub-ui's approach using API-provided metadata.
   */
  const getPermissionLabel = useCallback(
    (permission: string) => {
      // Use model_permissions from API if available (matches ansible-hub-ui)
      if (modelPermissions?.[permission]?.name) {
        return modelPermissions[permission].name;
      }
      // Fallback: format permission string (e.g., "galaxy.upload_to_namespace" -> "Upload to namespace")
      const parts = permission.split('.');
      const action = parts.length > 1 ? parts.slice(1).join('.') : permission;
      return action
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    [modelPermissions]
  );

  /**
   * Derive ui_category from permission string when model_permissions doesn't have it.
   * Maps permission patterns to category names matching the API's ui_category values.
   */
  const deriveUiCategory = useCallback(
    (permission: string): string => {
      // These category names match the API's ui_category values
      if (
        permission.includes('namespace') &&
        !permission.includes('container') &&
        !permission.includes('execution')
      ) {
        return t('Collection Namespaces');
      }
      if (permission.includes('collectionimport')) {
        return t('Collection Imports');
      }
      if (permission.includes('collection') && !permission.includes('remote')) {
        return t('Collections');
      }
      if (permission.includes('collectionremote') || permission.includes('remote')) {
        return t('Remotes');
      }
      if (permission.includes('ansiblerepository') || permission.includes('repository')) {
        return t('Ansible Repositories');
      }
      if (permission.includes('container') || permission.includes('execution')) {
        return t('Execution Environments');
      }
      if (permission.includes('task')) {
        return t('Tasks');
      }
      if (permission.includes('synclist')) {
        return t('Sync Lists');
      }
      if (permission.includes('group')) {
        return t('Groups');
      }
      if (permission.includes('user')) {
        return t('Users');
      }
      return t('Other');
    },
    [t]
  );

  /**
   * Group permissions by ui_category from model_permissions.
   * Falls back to deriving category from permission string pattern.
   */
  const groupPermissionsByContentType = useCallback(
    (permissions: string[]) => {
      const grouped: Record<string, { displayName: string; permissions: string[] }> = {};

      for (const permission of permissions) {
        // Use ui_category from model_permissions if available, otherwise derive from permission string
        const uiCategory =
          modelPermissions?.[permission]?.ui_category || deriveUiCategory(permission);
        const key = uiCategory.toLowerCase().replaceAll(/\s+/g, '_');

        if (!grouped[key]) {
          grouped[key] = { displayName: uiCategory, permissions: [] };
        }
        grouped[key].permissions.push(permission);
      }

      return grouped;
    },
    [modelPermissions, deriveUiCategory]
  );

  // Reset expanded roles when user/group changes
  useEffect(() => {
    setExpandedRoles({});
  }, [selectedUserParam, selectedGroupParam]);

  // Reset wizard state
  const resetWizardState = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
    setSelectedRoles([]);
    setError(null);
  };

  // Handle adding user
  const handleAddUser = async () => {
    if (!selectedUser || selectedRoles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onAddUser(
        selectedUser,
        selectedRoles.map((r) => r.name)
      );
      setShowUserWizard(false);
      resetWizardState();
    } catch {
      setError(t('Failed to add user. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding group
  const handleAddGroup = async () => {
    if (!selectedGroup || selectedRoles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onAddGroup(
        selectedGroup,
        selectedRoles.map((r) => r.name)
      );
      setShowGroupWizard(false);
      resetWizardState();
    } catch {
      setError(t('Failed to add group. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding roles to current user/group
  const handleAddRoles = async () => {
    if (selectedRoles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (currentUser) {
        await onAddUserRoles(
          currentUser,
          selectedRoles.map((r) => r.name)
        );
      } else if (currentGroup) {
        await onAddGroupRoles(
          currentGroup,
          selectedRoles.map((r) => r.name)
        );
      }
      setShowRoleWizard(false);
      resetWizardState();
    } catch {
      setError(t('Failed to add roles. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing user
  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onRemoveUser(userToRemove);
      setUserToRemove(null);
    } catch {
      setError(t('Failed to remove user. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing group
  const handleRemoveGroup = async () => {
    if (!groupToRemove) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onRemoveGroup(groupToRemove);
      setGroupToRemove(null);
    } catch {
      setError(t('Failed to remove group. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing role
  const handleRemoveRole = async () => {
    if (!roleToRemove) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (roleToRemove.target === 'user' && currentUser) {
        await onRemoveUserRole(currentUser, roleToRemove.role);
      } else if (roleToRemove.target === 'group' && currentGroup) {
        await onRemoveGroupRole(currentGroup, roleToRemove.role);
      }
      setRoleToRemove(null);
    } catch {
      setError(t('Failed to remove role. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Render user/group detail view (roles list)
  const renderRolesView = () => {
    const target = currentUser || currentGroup;
    const targetType = currentUser ? 'user' : 'group';
    const targetName = currentUser ? getUserName(currentUser) : currentGroup?.name || '';
    const objectRoles = target?.object_roles || [];

    return (
      <>
        <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
          {currentUser
            ? t('User {{name}}', { name: targetName })
            : t('Group {{name}}', { name: targetName })}
        </Title>

        {canEditOwners && (
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Button onClick={() => setShowRoleWizard(true)}>{t('Add roles')}</Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        )}

        {objectRoles.length === 0 ? (
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {t('No roles assigned')}
            </Title>
            <EmptyStateBody>
              {canEditOwners
                ? t('Add roles using the button above.')
                : t('No roles have been assigned.')}
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Table aria-label={t('Roles list')} variant="compact">
            <Thead>
              <Tr>
                <Th screenReaderText={t('Row expansion')} />
                <Th>{t('Role')}</Th>
                <Th />
              </Tr>
            </Thead>
            {objectRoles.map((role, rowIndex) => {
              const isExpanded = expandedRoles[role] || false;
              const details = roleDetails[role];
              const isLoading = roleDetailsLoading[role] || false;
              const roleDescription =
                managedRolesWithDescription[role] || details?.description || '';
              const permissions = details?.permissions || [];
              const groupedPermissions = groupPermissionsByContentType(permissions);

              return (
                <Tbody key={role} isExpanded={isExpanded}>
                  <Tr>
                    <Td
                      expand={{
                        rowIndex,
                        isExpanded,
                        onToggle: () => handleRoleExpand(role),
                        expandId: `expand-${role}`,
                      }}
                    />
                    <Td>{role}</Td>
                    <Td isActionCell>
                      {canEditOwners && (
                        <KebabDropdown
                          itemKey={role}
                          openKebab={openKebab}
                          setOpenKebab={setOpenKebab}
                          ariaLabel={t('Role actions')}
                          onRemove={() => setRoleToRemove({ role, target: targetType })}
                          removeLabel={t('Remove role')}
                        />
                      )}
                    </Td>
                  </Tr>
                  <Tr isExpanded={isExpanded}>
                    <Td colSpan={3}>
                      <ExpandableRowContent>
                        {isLoading ? (
                          <Flex
                            justifyContent={{ default: 'justifyContentCenter' }}
                            style={{ padding: '1rem' }}
                          >
                            <Spinner size="md" />
                          </Flex>
                        ) : (
                          <div style={{ padding: '0.5rem 0' }}>
                            {/* Role description */}
                            {roleDescription && (
                              <Content component="p" style={{ marginBottom: '1rem' }}>
                                {roleDescription}
                              </Content>
                            )}

                            {/* Permissions grouped by content type */}
                            {Object.keys(groupedPermissions).length > 0 && (
                              <DescriptionList
                                isHorizontal
                                horizontalTermWidthModifier={{
                                  default: '12ch',
                                  sm: '15ch',
                                  md: '20ch',
                                  lg: '28ch',
                                }}
                              >
                                {Object.entries(groupedPermissions).map(
                                  ([contentType, { displayName, permissions: perms }]) => (
                                    <PermissionGroupRow
                                      key={contentType}
                                      contentType={contentType}
                                      displayName={displayName}
                                      permissions={perms}
                                      getPermissionLabel={getPermissionLabel}
                                    />
                                  )
                                )}
                              </DescriptionList>
                            )}

                            {/* Show message if no permissions found */}
                            {!isLoading &&
                              !roleDescription &&
                              Object.keys(groupedPermissions).length === 0 && (
                                <Content
                                  component="p"
                                  style={{
                                    color: 'var(--pf-t--global--color--nonstatus--gray--default)',
                                  }}
                                >
                                  {t('No additional details available for this role.')}
                                </Content>
                              )}
                          </div>
                        )}
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                </Tbody>
              );
            })}
          </Table>
        )}
      </>
    );
  };

  // Render users section
  const renderUsersSection = () => {
    const hasUsers = users.length > 0;

    return (
      <>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
          {t('Users')}
        </Title>

        {hasUsers ? (
          <>
            {canEditOwners && (
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <Button onClick={() => setShowUserWizard(true)}>{t('Select a user')}</Button>
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
            )}
            <Table aria-label={t('User list')} variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('User')}</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => {
                  const userName = getUserName(user);
                  return (
                    <Tr key={userName}>
                      <Td>
                        <Link to={`${basePath}?user=${encodeURIComponent(userName)}`}>
                          {userName}
                        </Link>
                      </Td>
                      <Td isActionCell>
                        {canEditOwners && (
                          <KebabDropdown
                            itemKey={`user-${userName}`}
                            openKebab={openKebab}
                            setOpenKebab={setOpenKebab}
                            ariaLabel={t('User actions')}
                            onRemove={() => setUserToRemove(user)}
                            removeLabel={t('Remove user')}
                          />
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </>
        ) : (
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {t('There are currently no users assigned.')}
            </Title>
            <EmptyStateBody>
              {t('Except for members of groups below.')}
              {canEditOwners && <br />}
              {canEditOwners && t('Please add an owner by using the button below.')}
            </EmptyStateBody>
            {canEditOwners && (
              <Button onClick={() => setShowUserWizard(true)} style={{ marginTop: '1rem' }}>
                {t('Select a user')}
              </Button>
            )}
          </EmptyState>
        )}
      </>
    );
  };

  // Render groups section
  const renderGroupsSection = () => {
    const hasGroups = groups.length > 0;

    return (
      <>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
          {t('Groups')}
        </Title>

        {hasGroups ? (
          <>
            {canEditOwners && (
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <Button onClick={() => setShowGroupWizard(true)}>{t('Select a group')}</Button>
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
            )}
            <Table aria-label={t('Group list')} variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Group')}</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {groups.map((group) => (
                  <Tr key={group.name}>
                    <Td>
                      <Link to={`${basePath}?group=${encodeURIComponent(group.name)}`}>
                        {group.name}
                      </Link>
                    </Td>
                    <Td isActionCell>
                      {canEditOwners && (
                        <KebabDropdown
                          itemKey={`group-${group.name}`}
                          openKebab={openKebab}
                          setOpenKebab={setOpenKebab}
                          ariaLabel={t('Group actions')}
                          onRemove={() => setGroupToRemove(group)}
                          removeLabel={t('Remove group')}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </>
        ) : (
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {t('There are currently no groups assigned.')}
            </Title>
            <EmptyStateBody>
              {canEditOwners && t('Please add a group by using the button below.')}
            </EmptyStateBody>
            {canEditOwners && (
              <Button onClick={() => setShowGroupWizard(true)} style={{ marginTop: '1rem' }}>
                {t('Select a group')}
              </Button>
            )}
          </EmptyState>
        )}
      </>
    );
  };

  // Render main view or detail view
  const renderContent = () => {
    if (currentUser || currentGroup) {
      return renderRolesView();
    }

    return (
      <>
        {renderUsersSection()}
        <SectionSeparator />
        {renderGroupsSection()}
      </>
    );
  };

  // Default message for role selection if not provided
  const defaultRolesMessage =
    selectRolesMessage || t('The selected roles will be added to this specific resource.');

  return (
    <PageSection>
      {error && <Alert variant="danger" title={error} isInline style={{ marginBottom: '1rem' }} />}

      {renderContent()}

      {/* User Selection Wizard */}
      {showUserWizard && (
        <Modal
          aria-label={t('Select a user')}
          isOpen
          onClose={() => {
            setShowUserWizard(false);
            resetWizardState();
          }}
          variant={ModalVariant.large}
        >
          <ModalHeader title={t('Select a user')} />
          <ModalBody style={{ padding: 0 }}>
            <Wizard
              navAriaLabel={t('Select a user steps')}
              onClose={() => {
                setShowUserWizard(false);
                resetWizardState();
              }}
              onSave={handleAddUser}
            >
              <WizardStep
                name={t('Select a user')}
                id="select-user"
                footer={{ isNextDisabled: !selectedUser }}
              >
                <InsightsSelectUser
                  assignedUsers={users}
                  selectedUser={selectedUser}
                  onSelectUser={setSelectedUser}
                />
              </WizardStep>
              <WizardStep
                name={t('Select role(s)')}
                id="select-roles"
                footer={{ isNextDisabled: selectedRoles.length === 0 }}
              >
                <InsightsSelectRoles
                  assignedRoles={[]}
                  selectedRoles={selectedRoles}
                  onSelectRoles={setSelectedRoles}
                  message={defaultRolesMessage}
                  pulpObjectType={pulpObjectType}
                />
              </WizardStep>
              <WizardStep name={t('Preview')} id="preview">
                <Content component="p">
                  {t('The following roles will be applied to user:')}{' '}
                  <strong>{selectedUser?.username}</strong>
                </Content>
                <Flex direction={{ default: 'column' }} style={{ marginTop: '1rem' }}>
                  {selectedRoles.map((role, index) => (
                    <FlexItem key={role.name}>
                      <strong>{role.name}</strong>
                      {role.description && ` - ${role.description}`}
                      {role.permissions && role.permissions.length > 0 && (
                        <Flex style={{ marginTop: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {role.permissions.map((permission) => (
                            <FlexItem key={permission}>
                              <Label>{formatPermission(permission)}</Label>
                            </FlexItem>
                          ))}
                        </Flex>
                      )}
                      {index < selectedRoles.length - 1 && (
                        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                      )}
                    </FlexItem>
                  ))}
                </Flex>
              </WizardStep>
            </Wizard>
          </ModalBody>
        </Modal>
      )}

      {/* Group Selection Wizard */}
      {showGroupWizard && (
        <Modal
          aria-label={t('Select a group')}
          isOpen
          onClose={() => {
            setShowGroupWizard(false);
            resetWizardState();
          }}
          variant={ModalVariant.large}
        >
          <ModalHeader title={t('Select a group')} />
          <ModalBody style={{ padding: 0 }}>
            <Wizard
              navAriaLabel={t('Select a group steps')}
              onClose={() => {
                setShowGroupWizard(false);
                resetWizardState();
              }}
              onSave={handleAddGroup}
            >
              <WizardStep
                name={t('Select a group')}
                id="select-group"
                footer={{ isNextDisabled: !selectedGroup }}
              >
                <InsightsSelectGroup
                  assignedGroups={groups}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              </WizardStep>
              <WizardStep
                name={t('Select role(s)')}
                id="select-roles"
                footer={{ isNextDisabled: selectedRoles.length === 0 }}
              >
                <InsightsSelectRoles
                  assignedRoles={[]}
                  selectedRoles={selectedRoles}
                  onSelectRoles={setSelectedRoles}
                  message={defaultRolesMessage}
                  pulpObjectType={pulpObjectType}
                />
              </WizardStep>
              <WizardStep name={t('Preview')} id="preview">
                <Content component="p">
                  {t('The following roles will be applied to group:')}{' '}
                  <strong>{selectedGroup?.name}</strong>
                </Content>
                <Flex direction={{ default: 'column' }} style={{ marginTop: '1rem' }}>
                  {selectedRoles.map((role, index) => (
                    <FlexItem key={role.name}>
                      <strong>{role.name}</strong>
                      {role.description && ` - ${role.description}`}
                      {role.permissions && role.permissions.length > 0 && (
                        <Flex style={{ marginTop: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {role.permissions.map((permission) => (
                            <FlexItem key={permission}>
                              <Label>{formatPermission(permission)}</Label>
                            </FlexItem>
                          ))}
                        </Flex>
                      )}
                      {index < selectedRoles.length - 1 && (
                        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                      )}
                    </FlexItem>
                  ))}
                </Flex>
              </WizardStep>
            </Wizard>
          </ModalBody>
        </Modal>
      )}

      {/* Add Roles Wizard (for user/group detail view) */}
      {showRoleWizard && (
        <Modal
          aria-label={t('Select role(s)')}
          isOpen
          onClose={() => {
            setShowRoleWizard(false);
            resetWizardState();
          }}
          variant={ModalVariant.large}
        >
          <ModalHeader title={t('Select role(s)')} />
          <ModalBody style={{ padding: 0 }}>
            <Wizard
              navAriaLabel={t('Select role(s) steps')}
              onClose={() => {
                setShowRoleWizard(false);
                resetWizardState();
              }}
              onSave={handleAddRoles}
            >
              <WizardStep
                name={t('Select role(s)')}
                id="select-roles"
                footer={{ isNextDisabled: selectedRoles.length === 0 }}
              >
                <InsightsSelectRoles
                  assignedRoles={(currentUser || currentGroup)?.object_roles || []}
                  selectedRoles={selectedRoles}
                  onSelectRoles={setSelectedRoles}
                  pulpObjectType={pulpObjectType}
                />
              </WizardStep>
              <WizardStep name={t('Preview')} id="preview">
                <Content component="p">
                  {currentUser
                    ? t('The following roles will be applied to user:')
                    : t('The following roles will be applied to group:')}{' '}
                  <strong>{currentUser ? getUserName(currentUser) : currentGroup?.name}</strong>
                </Content>
                <Flex direction={{ default: 'column' }} style={{ marginTop: '1rem' }}>
                  {selectedRoles.map((role, index) => (
                    <FlexItem key={role.name}>
                      <strong>{role.name}</strong>
                      {role.description && ` - ${role.description}`}
                      {role.permissions && role.permissions.length > 0 && (
                        <Flex style={{ marginTop: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {role.permissions.map((permission) => (
                            <FlexItem key={permission}>
                              <Label>{formatPermission(permission)}</Label>
                            </FlexItem>
                          ))}
                        </Flex>
                      )}
                      {index < selectedRoles.length - 1 && (
                        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                      )}
                    </FlexItem>
                  ))}
                </Flex>
              </WizardStep>
            </Wizard>
          </ModalBody>
        </Modal>
      )}

      {/* Remove User Confirmation Modal */}
      {userToRemove && (
        <Modal
          variant={ModalVariant.small}
          isOpen
          onClose={() => setUserToRemove(null)}
          aria-labelledby="remove-user-modal-title"
        >
          <ModalHeader
            title={t('Remove user {{name}}?', { name: getUserName(userToRemove) })}
            titleIconVariant="warning"
            labelId="remove-user-modal-title"
          />
          <ModalBody>
            <Content>
              {t('You are about to remove {{name}} from {{resource}}.', {
                name: getUserName(userToRemove),
                resource: resourceName,
              })}
            </Content>
            <Content>{t('This will also remove all associated permissions.')}</Content>
          </ModalBody>
          <ModalFooter>
            <Button
              key="confirm"
              variant="danger"
              onClick={() => void handleRemoveUser()}
              isLoading={isProcessing}
            >
              {t('Remove')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setUserToRemove(null)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Remove Group Confirmation Modal */}
      {groupToRemove && (
        <Modal
          variant={ModalVariant.small}
          isOpen
          onClose={() => setGroupToRemove(null)}
          aria-labelledby="remove-group-modal-title"
        >
          <ModalHeader
            title={t('Remove group {{name}}?', { name: groupToRemove.name })}
            titleIconVariant="warning"
            labelId="remove-group-modal-title"
          />
          <ModalBody>
            <Content>
              {t('You are about to remove {{name}} from {{resource}}.', {
                name: groupToRemove.name,
                resource: resourceName,
              })}
            </Content>
            <Content>{t('This will also remove all associated permissions.')}</Content>
          </ModalBody>
          <ModalFooter>
            <Button
              key="confirm"
              variant="danger"
              onClick={() => void handleRemoveGroup()}
              isLoading={isProcessing}
            >
              {t('Remove')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setGroupToRemove(null)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Remove Role Confirmation Modal */}
      {roleToRemove && (
        <Modal
          variant={ModalVariant.small}
          isOpen
          onClose={() => setRoleToRemove(null)}
          aria-labelledby="remove-role-modal-title"
        >
          <ModalHeader
            title={t('Remove role {{role}}?', { role: roleToRemove.role })}
            titleIconVariant="warning"
            labelId="remove-role-modal-title"
          />
          <ModalBody>
            <Content>
              {t('You are about to remove {{role}} from {{target}} for {{resource}}.', {
                role: roleToRemove.role,
                target:
                  roleToRemove.target === 'user' && currentUser
                    ? getUserName(currentUser)
                    : currentGroup?.name,
                resource: resourceName,
              })}
            </Content>
            <Content>{t('This will also remove all associated permissions.')}</Content>
          </ModalBody>
          <ModalFooter>
            <Button
              key="confirm"
              variant="danger"
              onClick={() => void handleRemoveRole()}
              isLoading={isProcessing}
            >
              {t('Remove')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setRoleToRemove(null)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageSection>
  );
}
