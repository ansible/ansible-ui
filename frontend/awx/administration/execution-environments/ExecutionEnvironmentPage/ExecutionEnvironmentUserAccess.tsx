import { useParams } from 'react-router-dom';
import { UserAccess } from '../../../../common/access/components/UserAccess';
import { AwxRoute } from '../../../main/AwxRoutes';
import { usePageNavigate } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { awxAPI } from '../../../common/api/awx-utils';
import { useEffect } from 'react';

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
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'executionenvironment'}
      addRolesRoute={AwxRoute.ExecutionEnvironmentAddUsers}
    />
  );
}
