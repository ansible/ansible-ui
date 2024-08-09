import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
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
import { EdaTeam } from '../../interfaces/EdaTeam';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteTeams } from './hooks/useDeleteTeams';
import { useEdaView } from '../../common/useEventDrivenView';
import { edaAPI } from '../../common/eda-utils';
import { useTeamsFilters } from './hooks/useTeamsFilters';
import { useTeamColumns } from './hooks/useTeamColumns';

export function Teams() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('teams');
  const toolbarFilters = useTeamsFilters();

  const tableColumns = useTeamColumns();

  const view = useEdaView<EdaTeam>({
    url: edaAPI`/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<EdaTeam>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create team'),
        href: getPageUrl(EdaRoute.CreateTeam),
      },
      { type: PageActionType.Seperator },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete teams'),
        onClick: deleteTeams,
        isDanger: true,
      },
    ],
    [t, getPageUrl, deleteTeams]
  );

  const rowActions = useMemo<IPageAction<EdaTeam>[]>(() => {
    const actions: IPageAction<EdaTeam>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        href: (team) => {
          return getPageUrl(EdaRoute.EditTeam, { params: { id: team.id } });
        },
      },
      { type: PageActionType.Seperator },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
    return actions;
  }, [t, getPageUrl, deleteTeams]);

  return (
    <PageLayout>
      <PageHeader
        title={t('Teams')}
        titleHelpTitle={t('Teams')}
        titleHelp={t(
          'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
        )}
        description={t(
          'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
        )}
      />
      <PageTable<EdaTeam>
        id="eda-teams-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={t('There are currently no teams created.')}
        emptyStateDescription={t('Please create a team by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create team')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateTeam)}
        {...view}
        defaultSubtitle={t('Team')}
      />
    </PageLayout>
  );
}
