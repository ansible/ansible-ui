import { LoadingPage } from '@ansible/ansible-ui-framework';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubError } from '../../../common/HubError';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';

export function RemoteTeamAccess() {
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<PulpItemsResponse<HubRemote>>(
    pulpAPI`/remotes/ansible/collection/?name=${params.id}`
  );

  let remote: HubRemote | undefined = undefined;
  if (data && data.results && data.results.length > 0) {
    remote = data.results[0];
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <PlatformTeamAccess
      id={parsePulpIDFromURL(remote?.pulp_href) || ''}
      type={'galaxy.collectionremote'}
      addRolesRoute={HubRoute.RemoteAssignTeams}
    />
  );
}
