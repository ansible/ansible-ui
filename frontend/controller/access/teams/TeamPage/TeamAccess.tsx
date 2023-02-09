/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { IPageAction, PageActionType, PageTable } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { AccessRole, User } from '../../../interfaces/User';
import { useControllerView } from '../../../useControllerView';
import { useDeleteRoleConfirmationDialog } from '../../common/DeleteRoleConfirmation';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useUsersColumns } from '../../users/hooks/useUsersColumns';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import { useDeleteAccessRole } from '../hooks/useDeleteAccessRole';
import { useRemoveUsersFromTeam } from '../hooks/useRemoveUsersFromTeam';

export function TeamAccess(props: { team: Team }) {
  const { team } = props;
  const { t } = useTranslation();

  const toolbarFilters = useUsersFilters();

  const tableColumns = useUsersColumns();
  tableColumns.splice(1, 1);
  tableColumns.splice(4, 1);
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
        </DescriptionList>
      );
    },
  });

  const view = useControllerView<User>({
    url: `/api/v2/teams/${team.id}/access_list/`,
    queryParams: {
      order_by: 'first_name',
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const openDeleteRoleConfirmationDialog = useDeleteRoleConfirmationDialog();
  const deleteAccessRole = useDeleteAccessRole(team, () => void view.refresh());
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

  const selectUsersAddTeams = useSelectUsersAddTeams(() => void view.refresh());
  const removeUsersFromTeam = useRemoveUsersFromTeam();

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add users'),
        onClick: () => selectUsersAddTeams([team]),
      },
      {
        type: PageActionType.bulk,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        onClick: (users) => removeUsersFromTeam(users, team, view.unselectItemsAndRefresh),
      },
    ],
    [t, selectUsersAddTeams, team, removeUsersFromTeam, view.unselectItemsAndRefresh]
  );

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: (user) => removeUsersFromTeam([user], team, view.unselectItemsAndRefresh),
        isDisabled: (user: User) => {
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
    [removeUsersFromTeam, t, team, view.unselectItemsAndRefresh]
  );

  const history = useNavigate();

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
      emptyStateButtonClick={() => history(RouteE.CreateUser)}
      {...view}
    />
  );
}
