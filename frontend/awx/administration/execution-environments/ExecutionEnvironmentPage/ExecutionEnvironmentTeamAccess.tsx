import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { TeamAccess } from '@ansible/common-ui/access/components/TeamAccess';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ExecutionEnvironmentTeamAccess() {
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: executionEnvironment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );
  useEffect(() => {
    if (executionEnvironment?.managed || executionEnvironment?.organization === null) {
      /** Role assignments via team access tab is not applicable for managed and global EEs, redirect to EE details */
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
    <TeamAccess
      service="awx"
      id={params.id || ''}
      type={'executionenvironment'}
      addRolesRoute={AwxRoute.ExecutionEnvironmentAssignTeams as string}
    />
  );
}
