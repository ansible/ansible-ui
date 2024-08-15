import { useParams } from 'react-router-dom';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';
import { useGet } from '../../../common/crud/useGet';
import { HubRoute } from '../../main/HubRoutes';
import { LoadingPage } from '../../../../framework';
import { HubError } from '../../common/HubError';
import { TeamAccess } from '../../../common/access/components/TeamAccess';

export function HubNamespaceTeamAccess() {
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
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
      id={namespace?.id.toString() || ''}
      type={'namespace'}
      addRolesRoute={HubRoute.NamespaceAddTeams}
    />
  );
}
