import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { hubAPI } from '../../api';

export function useExecutionEnvironments() {
  const t = useGet<HubItemsResponse<ExecutionEnvironment>>(
    hubAPI`/v3/plugin/execution-environments/repositories/`
  );
  return t.data?.data;
}
