/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, usePageNavigate } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function OrganizationTeams() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const pageHistory = usePageNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({
    url: awxAPI`/organizations/${params.id ?? ''}/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <PageTable<Team>
      id="awx-teams-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={t('No teams yet')}
      emptyStateDescription={t('To get started, create a team.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Create team')}
      emptyStateButtonClick={() => pageHistory(AwxRoute.CreateTeam)}
      {...view}
    />
  );
}
