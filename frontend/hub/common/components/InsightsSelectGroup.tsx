/**
 * InsightsSelectGroup - Group selection step for Insights mode access wizards
 *
 * Displays a paginated, filterable list of groups that can be assigned to a resource.
 * Groups already assigned to the resource are filtered out of the list.
 *
 * Uses useHubView for data fetching with SWR caching and proper error handling.
 * Uses PageTable for consistent filtering UI following established patterns.
 */
import { ITableColumn, PageTable } from '@ansible/ansible-ui-framework';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHubTeamFilters } from '../../access/common/hooks/useHubTeamFilters';
import { hubAPI } from '../api/formatPath';
import { useHubView } from '../useHubView';

interface Group {
  id?: number;
  name: string;
  pulp_href?: string;
}

interface InsightsSelectGroupProps {
  /** Groups already assigned to the resource (will be filtered out) */
  assignedGroups: { name: string }[];
  /** Currently selected group */
  selectedGroup: Group | null;
  /** Callback when group selection changes */
  onSelectGroup: (group: Group | null) => void;
}

function useGroupColumns(): ITableColumn<Group>[] {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Group>[]>(
    () => [
      {
        header: t('Group'),
        type: 'text',
        value: (group) => group.name,
        sort: 'name',
      },
    ],
    [t]
  );
}

export function InsightsSelectGroup({
  assignedGroups,
  selectedGroup,
  onSelectGroup,
}: Readonly<InsightsSelectGroupProps>) {
  const { t } = useTranslation();
  const tableColumns = useGroupColumns();
  const toolbarFilters = useHubTeamFilters();

  const view = useHubView<Group>({
    url: hubAPI`/_ui/v1/groups/`,
    keyFn: (group) => group.name,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  // Filter out already assigned groups from the list
  // Must return an array (not undefined) to avoid PageTable showing loading state
  const filteredPageItems = useMemo(
    () =>
      (view.pageItems ?? []).filter(
        (group) => !assignedGroups.some((assigned) => assigned.name === group.name)
      ),
    [view.pageItems, assignedGroups]
  );

  // Adjust item count to reflect filtered results
  const filteredItemCount = useMemo(() => {
    if (!view.pageItems || view.itemCount === undefined) return view.itemCount;
    const removedCount = view.pageItems.length - filteredPageItems.length;
    return Math.max(0, view.itemCount - removedCount);
  }, [view.pageItems, view.itemCount, filteredPageItems]);

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      {selectedGroup && (
        <FlexItem>
          <Flex style={{ marginBottom: '1rem' }}>
            <FlexItem>
              <strong>{t('Selected group')}</strong>
            </FlexItem>
            <FlexItem>
              <Label color="blue">{selectedGroup.name}</Label>
            </FlexItem>
          </Flex>
        </FlexItem>
      )}

      <FlexItem style={{ flexGrow: 1, minHeight: 0 }}>
        <PageTable<Group>
          id="insights-select-group-table"
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading groups')}
          emptyStateTitle={t('No groups found')}
          emptyStateDescription={t('No groups match the current filter criteria.')}
          {...view}
          pageItems={filteredPageItems}
          itemCount={filteredItemCount}
          compact
          disableCardView
          disableListView
          disableBodyPadding
          isSelected={(group) => selectedGroup?.name === group.name}
          isSelectMultiple={false}
          onSelect={(group) => {
            onSelectGroup(group);
          }}
          rowActions={[]}
        />
      </FlexItem>
    </Flex>
  );
}
