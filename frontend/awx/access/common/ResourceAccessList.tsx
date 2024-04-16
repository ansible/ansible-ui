import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxView } from '../../common/useAwxView';
import { AccessRole, AwxUser } from '../../interfaces/User';
import { AwxRoute } from '../../main/AwxRoutes';
import { useSelectUsersAddTeams } from '../users/hooks/useSelectUsersAddTeams';
import { useUsersFilters } from '../users/hooks/useUsersFilters';
import { useDeleteRoleConfirmationDialog } from './DeleteRoleConfirmation';
import { useAccessColumns } from './useAccessColumns';
import { useDeleteAccessRole } from './useDeleteAccessRole';
import { useRemoveUsersFromResource } from './useRemoveUserFromResource';
import { useUserAndTeamRolesLists } from './useUserAndTeamRolesLists';

export type ResourceType = {
  type?: string | undefined;
  summary_fields: {
    object_roles: {
      member_role: { id: number };
    };
    user_capabilities: {
      edit: boolean;
    };
  };
};

// TODO: Expand to handle other resource types: | Project | Credential | Inventory | Organization | Template;

export function ResourceAccessList(props: { url: string; resource: ResourceType }) {
  const { t } = useTranslation();
  const { url, resource } = props;

  const { activeAwxUser } = useAwxActiveUser();
  const canAddAndRemoveUsers: boolean = useMemo(
    () => activeAwxUser?.is_superuser || resource?.summary_fields?.user_capabilities?.edit,
    [activeAwxUser?.is_superuser, resource?.summary_fields?.user_capabilities?.edit]
  );

  const toolbarFilters = useUsersFilters();

  const openDeleteRoleConfirmationDialog = useDeleteRoleConfirmationDialog();
  const deleteAccessRole = useDeleteAccessRole(() => void view.refresh());
  const deleteRole = (role: AccessRole, user: AwxUser) => {
    openDeleteRoleConfirmationDialog({
      role,
      user: user,
      onConfirm: deleteAccessRole,
    });
  };

  const tableColumns = useAccessColumns(undefined, deleteRole);

  const view = useAwxView<AwxUser>({
    url: url,
    queryParams: {
      order_by: 'first_name',
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  // Build the user and team roles lists for a user
  useUserAndTeamRolesLists(view.pageItems as AwxUser[]);

  /**
   * TODO: Add users is currently specific to teams and does not handle role selection
   * while adding a user to a team. This hook should be replaced with a hook to open up
   * the new PageWizard component when it becomes available.
   */
  const selectUsersAddTeams = useSelectUsersAddTeams(() => void view.refresh());

  const removeUsersFromResource = useRemoveUsersFromResource();

  const toolbarActions = useMemo<IPageAction<AwxUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add users'),
        isDisabled: canAddAndRemoveUsers
          ? undefined
          : t(
              'You do not have permission to add users. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => selectUsersAddTeams([resource]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        isDisabled: canAddAndRemoveUsers
          ? undefined
          : t(
              'You do not have permission to remove users. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: (users) => removeUsersFromResource(users, resource, view.unselectItemsAndRefresh),
        isDanger: true,
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

  const rowActions = useMemo<IPageAction<AwxUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: (user) => removeUsersFromResource([user], resource, view.unselectItemsAndRefresh),
        isDisabled: (user: AwxUser) => {
          if (user.is_superuser) {
            return t('System administrators have unrestricted access to all resources.');
          }
          if (user.is_system_auditor) {
            return t('System auditors have read access to all resources.');
          }
          if (
            !canAddAndRemoveUsers ||
            user.user_roles?.some((role) => !role.user_capabilities.unattach)
          ) {
            return t(
              'You do not have permission to remove users. Please contact your organization administrator if there is an issue with your access.'
            );
          }
          return undefined;
        },
        isDanger: true,
      },
    ],
    [canAddAndRemoveUsers, removeUsersFromResource, resource, t, view.unselectItemsAndRefresh]
  );

  const pageNavigate = usePageNavigate();

  return (
    <PageTable<AwxUser>
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('No users yet')}
      emptyStateDescription={t('To get started, create a user.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Create user')}
      emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateUser)}
      {...view}
    />
  );
}
