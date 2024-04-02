import { useTranslation } from 'react-i18next';
import {
  compareStrings,
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageTable,
  IToolbarFilter,
  ToolbarFilterType,
} from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useCallback, useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useEdaView } from '../../common/useEventDrivenView';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { requestDelete } from '../../../common/crud/Data';
import { TeamAssignment } from '../interfaces/TeamAssignment';

function useRemoveRoles(onComplete: (roles: TeamAssignment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useMemo<ITableColumn<TeamAssignment>[]>(
    () => [
      {
        header: t('Team'),
        type: 'description',
        value: (teamAccess: TeamAssignment) => teamAccess.summary_fields.team.name,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<TeamAssignment>();
  return useCallback(
    (items: TeamAssignment[]) => {
      bulkAction({
        title: t('Remove team assignment'),
        confirmText: t('Yes, I confirm that I want to remove these {{count}} team assignment.', {
          count: items.length,
        }),
        actionButtonText: t('Remove team assignment'),
        items: items.sort((l, r) =>
          compareStrings(l.summary_fields.team.name, r.summary_fields.team.name)
        ),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (item: TeamAssignment, signal: AbortSignal) =>
          requestDelete(edaAPI`/role_team_assignments/${item.id.toString()}/`, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

export function TeamAccess(id: string, type: string) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<TeamAssignment>[]>(
    () => [
      {
        header: t('Team'),
        type: 'description',
        sort: 'team__name',
        value: (teamAccess: TeamAssignment) => teamAccess.summary_fields.team.name,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role'),
        type: 'description',
        value: (teamAccess: TeamAssignment) => teamAccess.summary_fields.role_definition.name,
        sort: 'role_definition__name',
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role description'),
        type: 'description',

        value: (teamAccess: TeamAssignment) =>
          teamAccess.summary_fields.role_definition.description,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'team__name',
        label: t('Team name'),
        type: ToolbarFilterType.SingleText,
        query: 'team__name',
        comparison: 'equals',
      },
      {
        key: 'role_definition__name',
        label: t('Role name'),
        type: ToolbarFilterType.SingleText,
        query: 'role_definition__name',
        comparison: 'equals',
      },
    ],
    [t]
  );
  const view = useEdaView<TeamAssignment>({
    url: edaAPI`/role_team_assignments/`,
    tableColumns,
    toolbarFilters,
    queryParams: { object_id: id, content_type__model: type },
  });
  const removeRoles = useRemoveRoles(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<TeamAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove role'),
        onClick: (item: TeamAssignment) => removeRoles([item]),
      },
    ],
    [t, removeRoles]
  );
  const toolbarActions = useMemo<IPageAction<TeamAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        isPinned: true,
        label: t('Add role'),
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: (items: TeamAssignment[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, removeRoles]
  );
  return (
    <PageTable
      id="eda-team-access-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading role access data.')}
      emptyStateTitle={t('There are currently no roles assigned to this object.')}
      emptyStateDescription={t('Please add a role by using the button below.')}
      emptyStateButtonText={t('Add role')}
      // TODO navigate to add roles
      //emptyStateButtonClick={() => console.log('TODO')}
      {...view}
      defaultSubtitle={t('Project')}
    />
  );
}
