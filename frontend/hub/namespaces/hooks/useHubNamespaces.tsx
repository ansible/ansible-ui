import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { pulpAPI } from '../../api/utils';

export function useHubNamespaces() {
  const t = useGet<HubItemsResponse<HubNamespace>>(pulpAPI`/pulp_ansible/namespaces/`);
  return t.data?.results;
}
