import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { hubAPI } from '../../api';

export function useHubNamespaces() {
  const t = useGet<HubItemsResponse<HubNamespace>>(hubAPI`/_ui/v1/namespaces/`);
  return t.data?.data;
}
