import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../../framework';
import { TeamAccess } from '../../../../common/access/components/TeamAccess';
import { useGet } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubError } from '../../../common/HubError';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

export function RepositoryTeamAccess() {
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );

  let repository: Repository | undefined = undefined;
  if (data && data.results && data.results.length > 0) {
    repository = data.results[0];
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <TeamAccess
      service="hub"
      id={parsePulpIDFromURL(repository?.pulp_href) || ''}
      type={'ansiblerepository'}
      addRolesRoute={HubRoute.RepositoryAddTeams}
    />
  );
}
