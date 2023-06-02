import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespaces() {
  const t = useGet<HubItemsResponse<HubNamespace>>('/api/automation-hub/_ui/v1/namespaces/');
  return t.data?.data;
}
