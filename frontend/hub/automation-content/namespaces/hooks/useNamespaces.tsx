import { useGet } from '../../../../common/crud/useGet';
import { HubItemsResponse } from '../../../useHubView';
import { Namespace } from '../Namespace';

export function useNamespaces() {
  const t = useGet<HubItemsResponse<Namespace>>('/api/automation-hub/_ui/v1/namespaces/');
  return t.data?.data;
}
