import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { hubAPI } from '../../api/utils';

export function useHubNamespaces() {
  const t = useGet<HubItemsResponse<HubNamespace>>(hubAPI`/_ui/v1/namespaces/`);
  return t.data?.data;
}
