import { LoadingPage } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { PlatformTeamAccess } from '@ansible/common-ui/access/components/PlatformTeamAccess';

export function ExecutionEnvironmentTeamAccess() {
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
    <PlatformTeamAccess
      id={executionEnvironment?.namespace?.id?.toString() || ''}
      type={'galaxy.containernamespace'}
      addRolesRoute={HubRoute.ExecutionEnvironmentAssignTeams}
    />
  );
}
