import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import {
  CubesIcon,
  MinusCircleIcon,
  PencilAltIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxUser } from '../../interfaces/User';
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

  const view = useAwxView<AwxUser>({ url: awxAPI`/users/`, toolbarFilters, tableColumns });

  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh);

  const selectOrganizationsAddUsers = useSelectOrganizationsAddUsers();
  const selectTeamsAddUsers = useSelectTeamsAddUsers();
  const selectOrganizationsRemoveUsers = useSelectOrganizationsRemoveUsers();
  const selectTeamsRemoveUsers = useSelectTeamsRemoveUsers();

  const { data, isLoading: isLoadingUserOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/users/`
  );
  const canCreateUser = Boolean(data && data.actions && data.actions['POST']);

  const toolbarActions = useMemo<IPageAction<AwxUser>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
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
        label: t('Add users to teams'),
        onClick: () => selectTeamsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users from teams'),
        onClick: () => selectTeamsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Add users to organizations'),
        onClick: () => selectOrganizationsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users from organizations'),
        onClick: () => selectOrganizationsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete users'),
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

  const rowActions = useMemo<IPageAction<AwxUser>[]>(() => {
    const cannotDeleteUser = (user: AwxUser) =>
      user?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The user cannot be deleted due to insufficient permissions.`);
    const cannotEditUser = (user: AwxUser) =>
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
        isDisabled: (user: AwxUser) => cannotEditUser(user),
        onClick: (user) => pageNavigate(AwxRoute.EditUser, { params: { id: user?.id } }),
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
        isDisabled: (user: AwxUser) => cannotDeleteUser(user),
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
        titleHelpTitle={t('Users')}
        titleHelp={t(
          `A user is someone who has access to {{product}} with associated permissions and credentials.`,
          { product }
        )}
        titleDocLink={useGetDocsUrl(config, 'users')}
        description={t(
          `A user is someone who has access to {{product}} with associated permissions and credentials.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'user'} />}
      />
      {isLoadingUserOptions ? (
        <PageLoadingTable />
      ) : (
        <PageTable<AwxUser>
          id="awx-users-table"
          toolbarFilters={toolbarFilters}
          toolbarActions={toolbarActions}
          tableColumns={tableColumns}
          rowActions={rowActions}
          errorStateTitle={t('Error loading users')}
          emptyState={
            canCreateUser ? (
              <PageTableEmptyState
                title={t('There are currently no users added.')}
                description={t('Please create a user by using the button below.')}
              >
                <ButtonLink
                  icon={<PlusCircleIcon />}
                  variant={ButtonVariant.primary}
                  href={getPageUrl(AwxRoute.CreateUser)}
                >
                  {t('Create user')}
                </ButtonLink>
              </PageTableEmptyState>
            ) : (
              <PageTableEmptyState
                icon={CubesIcon}
                title={t('You do not have permission to create a user')}
                description={t(
                  'Please contact your organization administrator if there is an issue with your access.'
                )}
              />
            )
          }
          {...view}
        />
      )}
    </PageLayout>
  );
}
