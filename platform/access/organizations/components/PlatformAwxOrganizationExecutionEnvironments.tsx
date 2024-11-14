import { ExecutionEnvironmentsList } from '@ansible/awx-ui/administration/execution-environments/ExecutionEnvironmentsList';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';

export function PlatformAwxOrganizationExecutionEnvironments(params: { id?: string }) {
  const { id = '' } = params;
  return (
    <ExecutionEnvironmentsList
      url={awxAPI`/organizations/${id}/execution_environments/`}
      hideOrgColumn={true}
    />
  );
}
