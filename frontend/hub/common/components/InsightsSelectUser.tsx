/**
 * InsightsSelectUser - User selection step for Insights mode access wizards
 *
 * Displays a paginated, filterable list of users that can be assigned to a resource.
 * Users already assigned to the resource are filtered out of the list.
 *
 * Uses useHubView for data fetching with SWR caching and proper error handling.
 * Uses PageTable for consistent filtering UI following established patterns.
 */
import { ITableColumn, PageTable } from '@ansible/ansible-ui-framework';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHubUserFilters } from '../../access/common/hooks/useHubUserFilters';
import { hubAPI } from '../api/formatPath';
import { useHubView } from '../useHubView';

/**
 * Full user object from the /_ui/v1/users/ API.
 * The backend requires the full user object (not just username) when assigning
 * users to namespaces via PUT. Matches the Django User model fields.
 */
export interface InsightsApiUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  groups?: { id: number; name: string }[];
  date_joined?: string;
  is_superuser?: boolean;
  auth_provider?: string[];
}

interface InsightsSelectUserProps {
  /** Users already assigned to the resource (will be filtered out) */
  assignedUsers: { name?: string; username?: string }[];
  /** Currently selected user */
  selectedUser: InsightsApiUser | null;
  /** Callback when user selection changes */
  onSelectUser: (user: InsightsApiUser | null) => void;
}

function useUserColumns(): ITableColumn<InsightsApiUser>[] {
  const { t } = useTranslation();
  return useMemo<ITableColumn<InsightsApiUser>[]>(
    () => [
      {
        header: t('User'),
        type: 'text',
        value: (user) => user.username,
        sort: 'username',
      },
    ],
    [t]
  );
}

export function InsightsSelectUser({
  assignedUsers,
  selectedUser,
  onSelectUser,
}: Readonly<InsightsSelectUserProps>) {
  const { t } = useTranslation();
  const tableColumns = useUserColumns();
  const toolbarFilters = useHubUserFilters();

  const view = useHubView<InsightsApiUser>({
    url: hubAPI`/_ui/v1/users/`,
    keyFn: (user) => user.username,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  // Filter out already assigned users from the list
  // Must return an array (not undefined) to avoid PageTable showing loading state
  // Prioritize 'username' (canonical identifier from the users API) over 'name'
  // (namespace GET response field). Fall back to 'name' for RBAC wrapper which only sets 'name'.
  const filteredPageItems = useMemo(
    () =>
      (view.pageItems ?? []).filter(
        (user) =>
          !assignedUsers.some((assigned) => (assigned.username || assigned.name) === user.username)
      ),
    [view.pageItems, assignedUsers]
  );

  // Adjust item count to reflect filtered results
  const filteredItemCount = useMemo(() => {
    if (!view.pageItems || view.itemCount === undefined) return view.itemCount;
    const removedCount = view.pageItems.length - filteredPageItems.length;
    return Math.max(0, view.itemCount - removedCount);
  }, [view.pageItems, view.itemCount, filteredPageItems]);

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      {selectedUser && (
        <FlexItem>
          <Flex style={{ marginBottom: '1rem' }}>
            <FlexItem>
              <strong>{t('Selected user')}</strong>
            </FlexItem>
            <FlexItem>
              <Label color="blue">{selectedUser.username}</Label>
            </FlexItem>
          </Flex>
        </FlexItem>
      )}

      <FlexItem style={{ flexGrow: 1, minHeight: 0 }}>
        <PageTable<InsightsApiUser>
          id="insights-select-user-table"
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading users')}
          emptyStateTitle={t('No users found')}
          emptyStateDescription={t('No users match the current filter criteria.')}
          {...view}
          pageItems={filteredPageItems}
          itemCount={filteredItemCount}
          compact
          disableCardView
          disableListView
          disableBodyPadding
          isSelected={(user) => selectedUser?.username === user.username}
          isSelectMultiple={false}
          onSelect={(user) => {
            onSelectUser(user);
          }}
          rowActions={[]}
        />
      </FlexItem>
    </Flex>
  );
}
