import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespaces() {
  return useGet<HubItemsResponse<HubNamespace>>(hubAPI`/_ui/v1/namespaces/`);
}
