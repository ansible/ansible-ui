import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useAwxBulkConfirmation } from '@ansible/awx-ui/common/useAwxBulkConfirmation';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { CubesIcon, MinusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePlatformView } from '../../../hooks/usePlatformView';

export function PlatformAwxTeamUsers(props: { id?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const bulkAction = useAwxBulkConfirmation<UserAssignment>();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Username'),
        type: ToolbarFilterType.MultiText,
        query: 'user__username__icontains',
        comparison: 'contains',
      },
      {
        key: 'firstname',
        label: t('First name'),
        type: ToolbarFilterType.MultiText,
        query: 'user__first_name__icontains',
        comparison: 'contains',
      },
      {
        key: 'lastname',
        label: t('Last name'),
        type: ToolbarFilterType.SingleText,
        query: 'user__last_name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
  const tableColumns = useMemo<ITableColumn<UserAssignment>[]>(
    () => [
      {
        header: t('Username'),
        type: 'text',
        card: 'name',
        list: 'name',
        sort: 'user__username',
        value: (userAccess: UserAssignment) => userAccess?.summary_fields?.user?.username,
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (role) => role?.summary_fields?.user?.first_name,
        sort: 'user__first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (role) => role?.summary_fields?.user?.last_name,
        sort: 'user__last_name',
      },
    ],
    [t]
  );

  const view = usePlatformView<UserAssignment>({
    url: awxAPI`/role_user_assignments/`,
    queryParams: {
      role_definition__name: 'Controller Team Member',
      object_id: props?.id || params?.id?.toString() || '',
    },
    toolbarFilters,
    tableColumns,
  });

  const removeAssignment = useCallback(
    (users: UserAssignment[]) => {
      bulkAction({
        title: t('Remove users', { count: users.length }),
        confirmText: t(
          'Yes, I confirm that I want to remove these {{count}} users from the team.',
          {
            count: users.length,
          }
        ),
        actionButtonText: t('Remove user'),
        items: users,
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns: tableColumns,
        actionColumns: [tableColumns[0]],
        onComplete: view.unselectItemsAndRefresh,
        actionFn: (item: UserAssignment, signal: AbortSignal) =>
          requestDelete(awxAPI`/role_user_assignments/${item.id.toString()}/`, signal),
      });
    },
    [bulkAction, t, tableColumns, view.unselectItemsAndRefresh]
  );
  const rowActions = useMemo<IPageAction<UserAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: (user: UserAssignment) => removeAssignment([user]),
        isDanger: true,
      },
    ],
    [t, removeAssignment]
  );
  const toolbarActions = useMemo<IPageAction<UserAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove users'),
        onClick: (users: UserAssignment[]) => removeAssignment(users),
        isDanger: true,
      },
    ],
    [t, removeAssignment]
  );

  return (
    <PageTable<UserAssignment>
      id="platform-awx-team-users-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('There are currently no users added to this team.')}
      emptyStateIcon={CubesIcon}
      emptyStateButtonText={undefined}
      emptyStateActions={undefined}
      {...view}
    />
  );
}
