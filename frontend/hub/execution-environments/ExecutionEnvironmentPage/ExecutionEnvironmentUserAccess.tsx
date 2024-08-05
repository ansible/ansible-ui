import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { TeamAccess } from '../../../common/access/components/TeamAccess';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function ExecutionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<Partial<ExecutionEnvironment>>(
    hubAPI`/v3/plugin/execution-environments/repositories/${params.id ?? ''}/`
  );

  let executionEnvironment: Partial<ExecutionEnvironment> | undefined = undefined;
  if (data && Object.keys(data).length > 0) {
    executionEnvironment = data;
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
      id={executionEnvironment?.id?.toString() || ''}
      type={'execution-environment'}
      addRolesRoute={HubRoute.ExecutionEnvironmentAddUsers}
    />
  );
}
