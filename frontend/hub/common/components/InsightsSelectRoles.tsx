/**
 * InsightsSelectRoles - Role selection step for Insights mode access wizards
 *
 * Displays a paginated, filterable list of roles that can be assigned.
 * Roles already assigned are filtered out of the list. Supports multi-select.
 *
 * Uses useHubView for data fetching with SWR caching and proper error handling.
 * Uses PageTable for consistent filtering UI following established patterns.
 */
import {
  ITableColumn,
  IToolbarFilter,
  PageTable,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { Content, Flex, FlexItem, Label, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApiPath, pulpAPI } from '../api/formatPath';
import { useHubView } from '../useHubView';

export interface Role {
  name: string;
  description?: string;
  pulp_href?: string;
  permissions?: string[];
}

interface InsightsSelectRolesProps {
  /** Roles already assigned (will be filtered out) */
  assignedRoles: string[];
  /** Currently selected roles */
  selectedRoles: Role[];
  /** Callback when role selection changes */
  onSelectRoles: (roles: Role[]) => void;
  /** Optional message to display */
  message?: string;
  /** Pulp object type to filter roles (e.g., 'pulp_ansible/namespaces') */
  pulpObjectType?: string;
}

function useRoleColumns(): ITableColumn<Role>[] {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Role>[]>(
    () => [
      {
        header: t('Role'),
        type: 'text',
        value: (role) => role.name,
        sort: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (role) => role.description || '',
      },
    ],
    [t]
  );
}

/**
 * Pulp roles API uses `name__icontains` for case-insensitive filtering.
 * This differs from useHubRoleFilters which uses `name__contains`.
 */
function usePulpRoleFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}

export function InsightsSelectRoles({
  assignedRoles,
  selectedRoles,
  onSelectRoles,
  message,
  pulpObjectType,
}: Readonly<InsightsSelectRolesProps>) {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const toolbarFilters = usePulpRoleFilters();

  // Build the for_object_type query parameter
  // Format: /api/automation-hub/pulp/api/v3/pulp_ansible/namespaces/
  const forObjectType = pulpObjectType ? `${hubApiPath}/pulp/api/v3/${pulpObjectType}/` : undefined;

  const view = useHubView<Role>({
    url: pulpAPI`/roles/`,
    keyFn: (role) => role.name,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: {
      name__startswith: 'galaxy.',
      ordering: 'name',
      ...(forObjectType ? { for_object_type: forObjectType } : {}),
    },
  });

  // Filter out already assigned roles from the list
  // Must return an array (not undefined) to avoid PageTable showing loading state
  const filteredPageItems = useMemo(
    () => (view.pageItems ?? []).filter((role) => !assignedRoles.includes(role.name)),
    [view.pageItems, assignedRoles]
  );

  // Adjust item count to reflect filtered results
  const filteredItemCount = useMemo(() => {
    if (!view.pageItems || view.itemCount === undefined) return view.itemCount;
    const removedCount = view.pageItems.length - filteredPageItems.length;
    return Math.max(0, view.itemCount - removedCount);
  }, [view.pageItems, view.itemCount, filteredPageItems]);

  // Check if there are any active filter values set by the user
  const hasActiveFilters = useMemo(
    () => Object.values(view.filterState ?? {}).some((values) => values && values.length > 0),
    [view.filterState]
  );

  // When all items are filtered out (by assignedRoles) and there are no user-set filters,
  // pass empty filterState to show "No roles found" instead of "No results found"
  const effectiveFilterState = useMemo(
    () => (filteredItemCount === 0 && !hasActiveFilters ? {} : view.filterState),
    [filteredItemCount, hasActiveFilters, view.filterState]
  );

  const isSelected = (name: string) => selectedRoles.some((r) => r.name === name);

  const handleRemoveRole = (roleName: string) => {
    onSelectRoles(selectedRoles.filter((r) => r.name !== roleName));
  };

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      {message && (
        <FlexItem>
          <Content style={{ marginBottom: '1rem' }}>{message}</Content>
        </FlexItem>
      )}

      {selectedRoles.length > 0 && (
        <FlexItem>
          <Flex style={{ marginBottom: '1rem' }}>
            <FlexItem>
              <strong>{t('Selected roles')}</strong>
            </FlexItem>
            <FlexItem style={{ flexGrow: 1 }}>
              <LabelGroup>
                {selectedRoles.map((role) => (
                  <Label key={role.name} color="blue" onClose={() => handleRemoveRole(role.name)}>
                    {role.name}
                  </Label>
                ))}
              </LabelGroup>
            </FlexItem>
          </Flex>
        </FlexItem>
      )}

      <FlexItem style={{ flexGrow: 1, minHeight: 0 }}>
        <PageTable<Role>
          id="insights-select-roles-table"
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading roles')}
          emptyStateTitle={t('No roles found')}
          emptyStateDescription={t('No roles match the current filter criteria.')}
          {...view}
          pageItems={filteredPageItems}
          itemCount={filteredItemCount}
          filterState={effectiveFilterState}
          compact
          disableCardView
          disableListView
          disableBodyPadding
          showSelect
          isSelected={(role) => isSelected(role.name)}
          isSelectMultiple={true}
          selectItem={(role) => {
            if (!isSelected(role.name)) {
              onSelectRoles([...selectedRoles, role]);
            }
          }}
          selectItems={(roles) => {
            const newRoles = roles.filter((r) => !isSelected(r.name));
            if (newRoles.length > 0) {
              onSelectRoles([...selectedRoles, ...newRoles]);
            }
          }}
          unselectItem={(role) => {
            onSelectRoles(selectedRoles.filter((r) => r.name !== role.name));
          }}
          unselectAll={() => {
            onSelectRoles([]);
          }}
          rowActions={[]}
        />
      </FlexItem>
    </Flex>
  );
}
