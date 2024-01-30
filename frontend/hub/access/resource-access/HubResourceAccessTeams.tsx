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
import { HubResourceAccessTeam } from './HubResourceAccessInterfaces';
import { useTranslation } from 'react-i18next';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

function teamKeyFn(team: HubResourceAccessTeam) {
  return team.id;
}

export function HubResourceAccessTeams(props: {
  teams: HubResourceAccessTeam[];
  canEditAccess: boolean;
  resourceId: string;
  teamPageRoute: string;
  addTeamRoute: string;
}) {
  const { teams, canEditAccess, resourceId, teamPageRoute, addTeamRoute } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<HubResourceAccessTeam>[]>(
    () => [
      {
        header: t('Team'),
        cell: (team) => (
          <TextCell
            text={team.name}
            to={getPageUrl(teamPageRoute, { params: { id: resourceId, teamname: team.name } })}
          />
        ),
        key: 'name',
        value: (team) => team.name,
        sort: 'name',
        card: 'name',
        list: 'name',
      },
    ],
    [getPageUrl, resourceId, t, teamPageRoute]
  );

  const toolbarActions = useMemo<IPageAction<HubResourceAccessTeam>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add team'),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to add a team. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(addTeamRoute)}`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: () => alert(t('Todo')),
        isDanger: true,
      },
    ],
    [addTeamRoute, canEditAccess, getPageUrl, t]
  );

  const rowActions = useMemo<IPageAction<HubResourceAccessTeam>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: () => alert(t('Todo')),
        isDisabled: canEditAccess
          ? undefined
          : t(
              'You do not have permission to delete a team. Please contact your system administrator if there is an issue with your access.'
            ),
        isDanger: true,
      },
    ],
    [canEditAccess, t]
  );

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.Text,
        label: t('Name'),
        key: 'name',
        query: 'name',
        comparison: 'contains',
        placeholder: t('Filter by team name'),
        isPinned: true,
      },
    ];
    return filters;
  }, [t]);

  const view = useInMemoryView<HubResourceAccessTeam>({
    keyFn: teamKeyFn,
    items: teams,
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
          ? t('There are currently no teams added.')
          : t('You do not have permission to add a team.')
      }
      emptyStateDescription={
        canEditAccess
          ? t('Please add a team by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditAccess ? undefined : CubesIcon}
      emptyStateActions={canEditAccess ? toolbarActions.slice(0, 1) : undefined}
      defaultSubtitle={t('Teams')}
      errorStateTitle={t('Error loading teams.')}
    />
  );
}
