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
import { ResourceAccessTeam } from './HubResourceAccessInterfaces';
import { useTranslation } from 'react-i18next';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { HubRoute } from '../../main/HubRoutes';

function teamKeyFn(team: ResourceAccessTeam) {
  return team.id;
}

export function HubResourceAccessTeams(props: {
  teams: ResourceAccessTeam[];
  canEditAccess: boolean;
}) {
  const { teams, canEditAccess } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<ResourceAccessTeam>[]>(
    () => [
      {
        header: t('Team'),
        cell: (team) => (
          <TextCell
            text={team.name}
            // to={getPageUrl(HubRoute.NamespacePage, { params: { id: namespace.name } })}
          />
        ),
        key: 'name',
        value: (team) => team.name,
        sort: 'name',
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );

  const toolbarActions = useMemo<IPageAction<ResourceAccessTeam>[]>(
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
        href: `${getPageUrl(HubRoute.NamespaceTeamAccessAddTeam)}`,
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
    [canEditAccess, getPageUrl, t]
  );

  const rowActions = useMemo<IPageAction<ResourceAccessTeam>[]>(
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
    [t]
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

  const view = useInMemoryView<ResourceAccessTeam>({
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
