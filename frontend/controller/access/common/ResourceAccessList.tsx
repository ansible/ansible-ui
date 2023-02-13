import {
  ButtonVariant,
  Chip,
  ChipGroup,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, IPageActionButton, PageActionType, PageTable } from '../../../../framework';
import { useActiveUser } from '../../../common/useActiveUser';
import { RouteE } from '../../../Routes';
import { Team } from '../../interfaces/Team';
import { AccessRole, User } from '../../interfaces/User';
import { useControllerView } from '../../useControllerView';
import { useDeleteAccessRole } from './useDeleteAccessRole';
import { useSelectUsersAddTeams } from '../users/hooks/useSelectUsersAddTeams';
import { useUsersColumns } from '../users/hooks/useUsersColumns';
import { useUsersFilters } from '../users/hooks/useUsersFilters';
import { useDeleteRoleConfirmationDialog } from './DeleteRoleConfirmation';
import { useRemoveUsersFromResource } from './useRemoveUserFromResource';

export type ResourceType = Team; // TODO: Expand to handle other resource types: | Project | Credential | Inventory | Organization | Template;

export function ResourceAccessList(props: { url: string; resource: ResourceType }) {
  const { t } = useTranslation();
  const { url, resource } = props;

  const activeUser = useActiveUser();
  const canAddAndRemoveUsers: boolean = useMemo(
    () => activeUser?.is_superuser || resource?.summary_fields?.user_capabilities?.edit,
    [activeUser?.is_superuser, resource?.summary_fields?.user_capabilities?.edit]
  );

  const toolbarFilters = useUsersFilters();

  const tableColumns = useUsersColumns();
  tableColumns.splice(1, 1);
  tableColumns.splice(4, 1);
  // Set up Roles column
  tableColumns.push({
    header: t('Roles'),
    cell: (user) => {
      return (
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '8ch',
          }}
        >
          {user?.user_roles?.length ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('User roles')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ChipGroup>
                  {user.user_roles.map((role) => (
                    <Chip
                      key={role.id}
                      onClick={() => deleteRole(role, user)}
                      isReadOnly={!role.user_capabilities.unattach}
                      ouiaId={`${role.name}-${role.id}`}
                      closeBtnAriaLabel={t`Remove ${role.name} chip`}
                    >
                      {role.name}
                    </Chip>
                  ))}
                </ChipGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          {user?.team_roles?.length ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Team roles')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ChipGroup>
                  {user.team_roles.map((role) => (
                    <Chip
                      key={role.id}
                      onClick={() => deleteRole(role, user)}
                      isReadOnly={!role.user_capabilities.unattach}
                      ouiaId={`team-role-${role.name}-${role.id}`}
                      closeBtnAriaLabel={t`Remove ${role.name} chip`}
                    >
                      {role.name}
                    </Chip>
                  ))}
                </ChipGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      );
    },
  });

  const view = useControllerView<User>({
    url: url,
    queryParams: {
      order_by: 'first_name',
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const openDeleteRoleConfirmationDialog = useDeleteRoleConfirmationDialog();
  const deleteAccessRole = useDeleteAccessRole(() => void view.refresh());
  const deleteRole = (role: AccessRole, user: User) => {
    openDeleteRoleConfirmationDialog({
      role,
      user: user,
      onConfirm: deleteAccessRole,
    });
  };

  type Access = {
    descendant_roles: string[];
    role: AccessRole;
  };

  useEffect(() => {
    const users = view.pageItems as User[];
    function sortRoles(access: Access, user: User) {
      const { role } = access;
      if (role.team_id) {
        user.team_roles?.push(role);
      } else {
        user.user_roles?.push(role);
      }
    }

    if (users?.length > 0) {
      for (const user of users) {
        user.team_roles = [];
        user.user_roles = [];
        user.summary_fields?.direct_access?.forEach((access) => sortRoles(access, user));
        user.summary_fields?.indirect_access?.forEach((access) => sortRoles(access, user));
      }
    }
  }, [view.pageItems]);

  /**
   * TODO: Add users is currently specific to teams and does not handle role selection
   * while adding a user to a team. This hook should be replaced with a hook to open up
   * the new PageWizard component when it becomes available.
   */
  const selectUsersAddTeams = useSelectUsersAddTeams(() => void view.refresh());

  const removeUsersFromResource = useRemoveUsersFromResource(resource);

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add users'),
        isDisabled: canAddAndRemoveUsers
          ? undefined
          : t(
              'You do not have permission to add users. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        onClick: () => selectUsersAddTeams([resource]),
      } as IPageActionButton,
      {
        type: PageActionType.bulk,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        isDisabled: canAddAndRemoveUsers
          ? undefined
          : t(
              'You do not have permission to remove users. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        onClick: (users) => removeUsersFromResource(users, view.unselectItemsAndRefresh),
      },
    ],
    [
      t,
      canAddAndRemoveUsers,
      selectUsersAddTeams,
      resource,
      removeUsersFromResource,
      view.unselectItemsAndRefresh,
    ]
  );

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: (user) => removeUsersFromResource([user], view.unselectItemsAndRefresh),
        isDisabled: (user: User) => {
          if (
            !canAddAndRemoveUsers ||
            user.user_roles?.some((role) => !role.user_capabilities.unattach)
          ) {
            return t(
              'You do not have permission to remove users. Please contact your Organization Administrator if there is an issue with your access.'
            );
          }
          if (user.is_superuser) {
            return t('System administrators have unrestricted access to all resources.');
          }
          if (user.is_system_auditor) {
            return t('System auditors have read access to all resources.');
          }
          return undefined;
        },
      },
    ],
    [canAddAndRemoveUsers, removeUsersFromResource, t, view.unselectItemsAndRefresh]
  );

  const navigate = useNavigate();

  return (
    <PageTable<User>
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('No users yet')}
      emptyStateDescription={t('To get started, create a user.')}
      emptyStateButtonText={t('Create user')}
      emptyStateButtonClick={() => navigate(RouteE.CreateUser)}
      {...view}
    />
  );
}
