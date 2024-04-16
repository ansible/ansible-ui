import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Role } from '../../../interfaces/Role';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useRolesColumns } from '../../roles/useRolesColumns';
import { useRolesFilters } from '../../roles/useRolesFilters';

export function TeamRoles() {
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<Team>(awxAPI`/teams`, params.id);

  return team ? <TeamRolesInner team={team} /> : null;
}

export function TeamRolesInner(props: { team: Team }) {
  const { team } = props;
  const { t } = useTranslation();
  const toolbarFilters = useRolesFilters();
  const tableColumns = useRolesColumns();
  const pageNavigate = usePageNavigate();
  const view = useAwxView<Role>({
    url: awxAPI`/teams/${team.id.toString()}/roles/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  const getPageUrl = useGetPageUrl();
  const toolbarActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add role to team'),
        href: getPageUrl(AwxRoute.AddRolesToTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected roles from team'),
        onClick: () => alert('TODO'),
        isDanger: true,
      },
    ],
    [t, team.id, getPageUrl]
  );
  const rowActions = useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: TrashIcon,
        label: t('Remove role from team'),
        onClick: () => alert('TODO'),
        isDanger: true,
      },
    ],
    [t]
  );
  return (
    <PageTable<Role>
      id="awx-roles-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('Team does not have any roles.')}
      emptyStateDescription={t('To get started, add roles to the team.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Add role to team')}
      emptyStateButtonClick={() =>
        pageNavigate(AwxRoute.AddRolesToTeam, { params: { id: team.id } })
      }
      {...view}
    />
  );
}
