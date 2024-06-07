import { ExecutionEnvironmentsList } from '../../../../frontend/awx/administration/execution-environments/ExecutionEnvironmentsList';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';

export function PlatformAwxOrganizationExecutionEnvironments(params: { id?: string }) {
  const { id = '' } = params;
  return (
    <ExecutionEnvironmentsList
      url={awxAPI`/organizations/${id}/execution_environments/`}
      hideOrgColumn={true}
    />
  );
}
