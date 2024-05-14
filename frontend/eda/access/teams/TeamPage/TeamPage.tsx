/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteTeams } from '../hooks/useDeleteTeams';
import { edaAPI } from '../../../common/eda-utils';
import { EdaError } from '../../../common/EdaError';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team, error, refresh } = useGetItem<EdaTeam>(edaAPI`/teams/`, params.id);
  const pageNavigate = usePageNavigate();

  const deleteTeams = useDeleteTeams((deleted: EdaTeam[]) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Teams);
    }
  });

  const itemActions: IPageAction<EdaTeam>[] = useMemo(() => {
    const itemActions: IPageAction<EdaTeam>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        onClick: (team) => pageNavigate(EdaRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: (team) => {
          if (!team) return;
          deleteTeams([team]);
        },
        isDanger: true,
      },
    ];
    return itemActions;
  }, [deleteTeams, pageNavigate, t]);

  const getPageUrl = useGetPageUrl();

  if (error) return <EdaError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: getPageUrl(EdaRoute.Teams) }, { label: team?.name }]}
        headerActions={
          <PageActions<EdaTeam>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      {team && <TeamPageTabs team={team} />}
    </PageLayout>
  );
}

export function TeamPageTabs(props: { team: EdaTeam }) {
  const { team } = props;
  const { t } = useTranslation();
  return (
    <PageRoutedTabs
      backTab={{
        label: t('Back to Teams'),
        page: EdaRoute.Teams,
        persistentFilterKey: 'teams',
      }}
      tabs={[
        { label: t('Details'), page: EdaRoute.TeamDetails },
        { label: t('Team Roles'), page: EdaRoute.TeamRoles },
      ]}
      params={{ id: team.id }}
    />
  );
}
