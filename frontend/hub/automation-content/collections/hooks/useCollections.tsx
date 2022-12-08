import { useGet } from '../../../../common/useItem';
import { HubItemsResponse } from '../../../useHubView';
import { Collection } from '../Collection';

export function useCollections() {
  const t = useGet<HubItemsResponse<Collection>>('/api/automation-hub/_ui/v1/repo/published/');
  return t.data?.data;
}
