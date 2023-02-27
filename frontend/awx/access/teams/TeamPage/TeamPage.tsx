/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { useItem } from '../../../../common/useItem';
import { RouteObj } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { useViewActivityStream } from '../../common/useViewActivityStream';
import { useTeamActions } from '../hooks/useTeamActions';
import { TeamAccess } from './TeamAccess';
import { TeamDetails } from './TeamDetails';
import { TeamRoles } from './TeamRoles';

export function TeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const team = useItem<Team>('/api/v2/teams', params.id ?? '0');
  const navigate = useNavigate();
  const itemActions = useTeamActions({ onTeamsDeleted: () => navigate(RouteObj.Teams) });
  const viewActivityStreamAction = useViewActivityStream('team');
  const pageActions = [...viewActivityStreamAction, ...itemActions];
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
          <TeamDetails team={team!} />
        </PageTab>
        <PageTab label={t('Access')}>
          <TeamAccess team={team!} />
        </PageTab>
        <PageTab label={t('Roles')}>
          <TeamRoles team={team!} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
