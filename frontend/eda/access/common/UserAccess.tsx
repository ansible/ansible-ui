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
  useGetPageUrl,
} from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useCallback, useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useEdaView } from '../../common/useEventDrivenView';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { requestDelete } from '../../../common/crud/Data';
import { UserAssignment } from '../interfaces/UserAssignment';

function useRemoveRoles(onComplete: (roles: UserAssignment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useMemo<ITableColumn<UserAssignment>[]>(
    () => [
      {
        header: t('User'),
        type: 'description',
        value: (userAccess: UserAssignment) => userAccess.summary_fields.user.username,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<UserAssignment>();
  return useCallback(
    (items: UserAssignment[]) => {
      bulkAction({
        title: t('Remove user assignment'),
        confirmText: t('Yes, I confirm that I want to remove these {{count}} user assignment.', {
          count: items.length,
        }),
        actionButtonText: t('Remove user assignment'),
        items: items.sort((l, r) =>
          compareStrings(l.summary_fields.user.username, r.summary_fields.user.username)
        ),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (item: UserAssignment, signal: AbortSignal) =>
          requestDelete(edaAPI`/role_user_assignments/${item.id.toString()}/`, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

export function UserAccess(props: { id: string; type: string; addRolesRoute?: string }) {
  const { t } = useTranslation();
  const { id, type, addRolesRoute } = props;
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<UserAssignment>[]>(
    () => [
      {
        header: t('User'),
        type: 'description',
        sort: 'user__username',
        value: (userAccess: UserAssignment) => userAccess.summary_fields.user.username,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role'),
        type: 'description',
        value: (userAccess: UserAssignment) => userAccess.summary_fields.role_definition.name,
        sort: 'role_definition__name',
        card: 'description',
        list: 'description',
      },
      {
        header: t('Role description'),
        type: 'description',

        value: (userAccess: UserAssignment) =>
          userAccess.summary_fields.role_definition.description,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'user__username',
        label: t('User name'),
        type: ToolbarFilterType.SingleText,
        query: 'user__username',
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
  const view = useEdaView<UserAssignment>({
    url: edaAPI`/role_user_assignments/`,
    tableColumns,
    toolbarFilters,
    queryParams: { object_id: id, content_type__model: type },
  });
  const removeRoles = useRemoveRoles(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<UserAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove user'),
        onClick: (item: UserAssignment) => removeRoles([item]),
      },
    ],
    [t, removeRoles]
  );
  const toolbarActions = useMemo<IPageAction<UserAssignment>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add user'),
        href: getPageUrl(addRolesRoute ?? '', { params: { id: id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: (items: UserAssignment[]) => removeRoles(items),
        isDanger: true,
      },
    ],
    [t, getPageUrl, addRolesRoute, id, removeRoles]
  );
  return (
    <PageTable
      id="eda-user-access-table"
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading role access data.')}
      emptyStateTitle={t('There are currently no roles assigned to this object.')}
      emptyStateDescription={t('Please add a role by using the button below.')}
      emptyStateButtonText={t('Add role')}
      emptyStateActions={toolbarActions.slice(0, 1)}
      {...view}
      defaultSubtitle={t('User access')}
    />
  );
}
