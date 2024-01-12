import { ButtonVariant } from '@patternfly/react-core';
import {
  CubesIcon,
  MinusCircleIcon,
  PencilAltIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { User } from '../../interfaces/User';
import { AwxRoute } from '../../main/AwxRoutes';
import { useSelectOrganizationsAddUsers } from '../organizations/hooks/useSelectOrganizationsAddUsers';
import { useSelectOrganizationsRemoveUsers } from '../organizations/hooks/useSelectOrganizationsRemoveUsers';
import { useSelectTeamsAddUsers } from '../teams/hooks/useSelectTeamsAddUsers';
import { useSelectTeamsRemoveUsers } from '../teams/hooks/useSelectTeamsRemoveUsers';
import { useDeleteUsers } from './hooks/useDeleteUsers';
import { useUsersColumns } from './hooks/useUsersColumns';
import { useUsersFilters } from './hooks/useUsersFilters';

export function Users() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('users');
  const config = useAwxConfig();

  const toolbarFilters = useUsersFilters();

  const tableColumns = useUsersColumns();

  const view = useAwxView<User>({ url: awxAPI`/users/`, toolbarFilters, tableColumns });

  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);

  const selectOrganizationsAddUsers = useSelectOrganizationsAddUsers();
  const selectTeamsAddUsers = useSelectTeamsAddUsers();
  const selectOrganizationsRemoveUsers = useSelectOrganizationsRemoveUsers();
  const selectTeamsRemoveUsers = useSelectTeamsRemoveUsers();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/users/`);
  const canCreateUser = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create user'),
        isDisabled: canCreateUser
          ? undefined
          : t(
              'You do not have permission to create a user. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(AwxRoute.CreateUser),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Add selected users to teams'),
        onClick: () => selectTeamsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove selected users from teams'),
        onClick: () => selectTeamsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Add selected users to organizations'),
        onClick: () => selectOrganizationsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove selected users from organizations'),
        onClick: () => selectOrganizationsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: deleteUsers,
        isDanger: true,
      },
    ],
    [
      t,
      canCreateUser,
      getPageUrl,
      deleteUsers,
      selectTeamsAddUsers,
      view.selectedItems,
      selectTeamsRemoveUsers,
      selectOrganizationsAddUsers,
      selectOrganizationsRemoveUsers,
    ]
  );

  const rowActions = useMemo<IPageAction<User>[]>(() => {
    const cannotDeleteUser = (user: User) =>
      user?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The user cannot be deleted due to insufficient permissions.`);
    const cannotEditUser = (user: User) =>
      user?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The user cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit user'),
        isDisabled: (user: User) => cannotEditUser(user),
        onClick: (user) => pageNavigate(AwxRoute.EditUser, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: t('Add user to teams'),
        onClick: (user) => selectTeamsAddUsers([user]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user from teams'),
        onClick: (user) => selectTeamsRemoveUsers([user]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: t('Add user to organizations'),
        onClick: (user) => selectOrganizationsAddUsers([user]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user from organizations'),
        onClick: (user) => selectOrganizationsRemoveUsers([user]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        isDisabled: (user: User) => cannotDeleteUser(user),
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
  }, [
    deleteUsers,
    pageNavigate,
    selectOrganizationsAddUsers,
    selectOrganizationsRemoveUsers,
    selectTeamsAddUsers,
    selectTeamsRemoveUsers,
    t,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={t('Users')}
        titleHelpTitle={t('User')}
        titleHelp={t(
          `A user is someone who has access to {{product}} with associated permissions and credentials.`,
          { product }
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/users.html`}
        description={t(
          `A user is someone who has access to {{product}} with associated permissions and credentials.`,
          { product }
        )}
      />
      <PageTable<User>
        id="awx-users-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyStateTitle={
          canCreateUser
            ? t('There are currently no users added.')
            : t('You do not have permission to create a user')
        }
        emptyStateDescription={
          canCreateUser
            ? t('Please create a user by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateUser ? undefined : CubesIcon}
        emptyStateButtonText={canCreateUser ? t('Create user') : undefined}
        emptyStateButtonClick={canCreateUser ? () => pageNavigate(AwxRoute.CreateUser) : undefined}
        {...view}
      />
    </PageLayout>
  );
}

/* deprecated (see access/organizations/OrganizationPage/OrganizationAccess.tsx) */
export function AccessTable(props: { url: string }) {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const getPageUrl = useGetPageUrl();
  const view = useAwxView<User>({
    url: props.url,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add users'),
        shortLabel: t('Add access'),
        href: getPageUrl(AwxRoute.CreateUser),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: MinusCircleIcon,
        label: t('Remove selected users'),
        shortLabel: t('Remove access'),
        onClick: () => null,
        isDanger: true,
      },
    ],
    [getPageUrl, t]
  );

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  );

  const pageNavigate = usePageNavigate();

  return (
    <PageTable<User>
      id="awx-users-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('No users yet')}
      emptyStateDescription={t('To get started, create a user.')}
      emptyStateButtonText={t('Create user')}
      emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateUser)}
      {...view}
    />
  );
}
