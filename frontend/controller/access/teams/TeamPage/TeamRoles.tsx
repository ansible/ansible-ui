/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, PageTable } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Role } from '../../../interfaces/Role';
import { Team } from '../../../interfaces/Team';
import { useControllerView } from '../../../useControllerView';
import { useRolesColumns, useRolesFilters } from '../../roles/Roles';

export function TeamRoles(props: { team: Team }) {
  const { team } = props;
  const { t } = useTranslation();
  const toolbarFilters = useRolesFilters();
  const tableColumns = useRolesColumns();
  const navigate = useNavigate();
  const view = useControllerView<Role>({
    url: `/api/v2/teams/${team.id}/roles/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  const toolbarActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add role to team'),
        shortLabel: t('Add role'),
        onClick: () => navigate(RouteE.AddRolesToTeam.replace(':id', team.id.toString())),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Remove selected roles from team'),
        shortLabel: t('Remove roles'),
        onClick: () => alert('TODO'),
      },
    ],
    [navigate, t, team.id]
  );
  const rowActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: TrashIcon,
        label: t('Remove role from team'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  );
  return (
    <PageTable<Role>
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('Team does not have any roles.')}
      emptyStateDescription={t('To get started, add roles to the team.')}
      emptyStateButtonText={t('Add role to team')}
      emptyStateButtonClick={() =>
        navigate(RouteE.AddRolesToTeam.replace(':id', team.id.toString()))
      }
      {...view}
    />
  );
}
