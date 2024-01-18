import { useMemo } from 'react';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
  useInMemoryView,
} from '../../../../framework';
import { ResourceAccessUser } from './HubResourceAccessInterfaces';
import { useTranslation } from 'react-i18next';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { HubRoute } from '../../main/HubRoutes';

function userKeyFn(user: ResourceAccessUser) {
  return user.username;
}

export function HubResourceAccessUsers(props: {
  users: ResourceAccessUser[];
  canEditAccess: boolean;
}) {
  const { users, canEditAccess } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<ResourceAccessUser>[]>(
    () => [
      {
        header: t('User'),
        cell: (user) => (
          <TextCell
            text={user.username}
            // to={getPageUrl(HubRoute.NamespacePage, { params: { id: namespace.name } })}
          />
        ),
        key: 'username',
        value: (user) => user.username,
        sort: 'username',
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );

  const toolbarActions = useMemo<IPageAction<ResourceAccessUser>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add user'),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to add a user. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(HubRoute.NamespaceUserAccessAddUser)}`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: () => alert(t('Todo')),
        isDanger: true,
      },
    ],
    [canEditAccess, getPageUrl, t]
  );

  const rowActions = useMemo<IPageAction<ResourceAccessUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: () => alert(t('Todo')),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to delete a user. Please contact your system administrator if there is an issue with your access.'
            ),
        isDanger: true,
      },
    ],
    [t]
  );

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.Text,
        label: t('Username'),
        key: 'username',
        query: 'username',
        comparison: 'contains',
        placeholder: t('Filter by username'),
        isPinned: true,
      },
    ];
    return filters;
  }, [t]);

  const view = useInMemoryView<ResourceAccessUser>({
    keyFn: userKeyFn,
    items: users,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageTable
      {...view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      emptyStateTitle={
        canEditAccess
          ? t('There are currently no users added.')
          : t('You do not have permission to add a user.')
      }
      emptyStateDescription={
        canEditAccess
          ? t('Please add a user by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditAccess ? undefined : CubesIcon}
      emptyStateActions={canEditAccess ? toolbarActions.slice(0, 1) : undefined}
      defaultSubtitle={t('Users')}
      errorStateTitle={t('Error loading users.')}
    />
  );
}
