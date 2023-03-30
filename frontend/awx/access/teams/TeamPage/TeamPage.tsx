/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { RouteObj } from '../../../../Routes';
import { AwxError } from '../../../common/AwxError';
import { Team } from '../../../interfaces/Team';
import { useViewActivityStream } from '../../common/useViewActivityStream';
import { useTeamActions } from '../hooks/useTeamActions';
import { TeamAccess } from './TeamAccess';
import { TeamDetails } from './TeamDetails';
import { TeamRoles } from './TeamRoles';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: team, refresh } = useGetItem<Team>('/api/v2/teams', params.id);
  const navigate = useNavigate();
  const itemActions = useTeamActions({
    onTeamsDeleted: () => navigate(RouteObj.Teams),
    isDetailsPageAction: true,
  });
  const viewActivityStreamAction = useViewActivityStream('team');
  const pageActions = [...viewActivityStreamAction, ...itemActions];

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!team) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={team?.name}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: team?.name }]}
        headerActions={
          <PageActions<Team>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={team}
          />
        }
      />
      <PageTabs loading={!team}>
        <PageTab label={t('Details')}>
          <TeamDetails team={team} />
        </PageTab>
        <PageTab label={t('Access')}>
          <TeamAccess team={team} />
        </PageTab>
        <PageTab label={t('Roles')}>
          <TeamRoles team={team} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
