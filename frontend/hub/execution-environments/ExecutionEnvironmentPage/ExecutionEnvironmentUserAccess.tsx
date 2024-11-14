import { LoadingPage } from '@ansible/ansible-ui-framework';
import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router-dom';
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
    <UserAccess
      service="hub"
      id={executionEnvironment?.namespace?.id?.toString() || ''}
      type={'containernamespace'}
      addRolesRoute={HubRoute.ExecutionEnvironmentAddUsers}
    />
  );
}
