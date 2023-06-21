import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { Collection } from '../Collection';
import { hubAPI } from '../../api';

export function useCollections() {
  const t = useGet<HubItemsResponse<Collection>>(hubAPI`/_ui/v1/repo/published/`);
  return t.data?.data;
}
