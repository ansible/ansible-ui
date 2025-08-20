import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ExecutionEnvironmentUserAccess() {
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: executionEnvironment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );
  useEffect(() => {
    if (executionEnvironment?.managed || executionEnvironment?.organization === null) {
      /** Role assignments via user access tab is not applicable for managed and global EEs, redirect to EE details */
      pageNavigate(AwxRoute.ExecutionEnvironmentDetails, {
        params: { id: executionEnvironment?.id },
      });
    }
  }, [
    pageNavigate,
    executionEnvironment?.managed,
    executionEnvironment?.organization,
    executionEnvironment?.id,
  ]);
  return (
    <ResourceUserAccess
      service="awx"
      id={params.id || ''}
      type={'awx.executionenvironment'}
      addRolesRoute={AwxRoute.ExecutionEnvironmentAddUsers}
      manageRoleRoute={AwxRoute.ExecutionEnvironmentManageUsers}
    />
  );
}
