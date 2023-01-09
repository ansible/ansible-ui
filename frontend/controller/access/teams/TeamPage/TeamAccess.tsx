/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant, Label, LabelGroup } from '@patternfly/react-core';
import { MinusCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, PageTable } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useControllerView } from '../../../useControllerView';
import { useRemoveUsersFromTeams } from '../../users/hooks/useRemoveUsersFromTeams';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useUsersColumns } from '../../users/hooks/useUsersColumns';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';

export function TeamAccess(props: { team: Team }) {
  const { team } = props;
  const { t } = useTranslation();

  const toolbarFilters = useUsersFilters();

  const tableColumns = useUsersColumns();
  tableColumns.splice(1, 0, {
    header: t('Roles'),
    cell: (user) => (
      <LabelGroup>
        {user.summary_fields?.indirect_access?.map((access) => (
          <Label
            key={access.role.id}
            color={user.is_superuser || user.is_system_auditor ? 'orange' : undefined}
          >
            {access.role.name}
          </Label>
        ))}
      </LabelGroup>
    ),
  });

  const view = useControllerView<User>({
    url: `/api/v2/teams/${team.id}/access_list/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const selectUsersAddTeams = useSelectUsersAddTeams(() => void view.refresh());
  const removeUsersFromTeams = useRemoveUsersFromTeams();

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
        onClick: (users) => removeUsersFromTeams(users, [team], view.unselectItemsAndRefresh),
      },
    ],
    [t, selectUsersAddTeams, team, removeUsersFromTeams, view.unselectItemsAndRefresh]
  );

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        onClick: (user) => removeUsersFromTeams([user], [team], view.unselectItemsAndRefresh),
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
    [removeUsersFromTeams, t, team, view.unselectItemsAndRefresh]
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
