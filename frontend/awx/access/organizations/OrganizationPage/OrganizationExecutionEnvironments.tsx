import { ExecutionEnvironmentsList } from '../../../administration/execution-environments/ExecutionEnvironmentsList';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';

export function OrganizationExecutionEnvironments() {
  const { id = '' } = useParams<{ id: string }>();
  return (
    <ExecutionEnvironmentsList
      url={awxAPI`/organizations/${id}/execution_environments/`}
      hideOrgColumn={true}
    />
  );
}
