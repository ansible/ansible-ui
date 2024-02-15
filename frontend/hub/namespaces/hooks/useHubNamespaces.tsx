import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';

export function useHubNamespaces(namespaceName: string | null | undefined) {
  let url = '';
  if (namespaceName) {
    url = hubAPI`/_ui/v1/namespaces/?limit=1&name=${namespaceName}`;
  }

  return useGet<HubItemsResponse<HubNamespace>>(url);
}
