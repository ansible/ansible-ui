import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../api/formatPath';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespaces() {
  return useGet<HubItemsResponse<HubNamespace>>(hubAPI`/_ui/v1/namespaces/`);
}
