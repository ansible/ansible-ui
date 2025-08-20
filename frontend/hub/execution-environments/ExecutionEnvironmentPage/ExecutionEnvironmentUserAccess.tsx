import { LoadingPage } from '@ansible/ansible-ui-framework';
import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router-dom';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function ExecutionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  const {
    data: executionEnvironment,
    error,
    isLoading,
    refresh,
  } = useGet<ExecutionEnvironment>(
    hubAPI`/v3/plugin/execution-environments/repositories/${params.id ?? ''}/`
  );

  if (isLoading || (!executionEnvironment && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <ResourceUserAccess
      service="hub"
      id={executionEnvironment?.namespace?.id || ''}
      name={executionEnvironment?.name || ''}
      type={'galaxy.containernamespace'}
      addRolesRoute={HubRoute.ExecutionEnvironmentAddUsers}
      manageRoleRoute={HubRoute.ExecutionEnvironmentManageUsers}
    />
  );
}
