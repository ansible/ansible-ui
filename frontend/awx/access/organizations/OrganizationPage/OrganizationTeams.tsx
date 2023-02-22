/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Organization } from '../../../interfaces/Organization';
import { Team } from '../../../interfaces/Team';
import { useControllerView } from '../../../useAwxView';
import { useTeamsColumns } from '../../teams/hooks/useTeamsColumns';
import { useTeamsFilters } from '../../teams/hooks/useTeamsFilters';

export function OrganizationTeams(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();
  const history = useNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useControllerView<Team>({
    url: `/api/v2/organizations/${organization.id}/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <PageTable<Team>
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={t('No teams yet')}
      emptyStateDescription={t('To get started, create a team.')}
      emptyStateButtonText={t('Create team')}
      emptyStateButtonClick={() => history(RouteE.CreateTeam)}
      {...view}
    />
  );
}
