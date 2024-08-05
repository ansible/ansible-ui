import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { TeamAccess } from '../../../common/access/components/TeamAccess';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function ExecutionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<HubItemsResponse<ExecutionEnvironment>>(
    hubAPI`/_ui/v1/execution-environments/?limit=1&name=${params.id}`
  );

  let executionEnvironment: ExecutionEnvironment | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    executionEnvironment = data.data[0];
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
      id={executionEnvironment?.id.toString() || ''}
      type={'execution-environment'}
      addRolesRoute={HubRoute.ExecutionEnvironmentAddUsers}
    />
  );
}
