import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function useExecutionEnvironments() {
  const t = useGet<HubItemsResponse<ExecutionEnvironment>>(
    '/api/automation-hub/v3/plugin/execution-environments/repositories/'
  );
  return t.data?.data;
}
