import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironments } from '../../../administration/execution-environments/ExecutionEnvironments';

export function OrganizationExecutionEnvironments() {
  const { id = '' } = useParams<{ id: string }>();
  return (
    <ExecutionEnvironments url={awxAPI`/execution_environments/`} executionEnvironmentId={id} />
  );
}
