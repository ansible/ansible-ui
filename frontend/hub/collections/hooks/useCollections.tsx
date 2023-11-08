import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../api/formatPath';
import { HubItemsResponse } from '../../useHubView';
import { Collection } from '../Collection';

export function useCollections() {
  const t = useGet<HubItemsResponse<Collection>>(hubAPI`/_ui/v1/repo/published/`);
  return t.data?.data;
}
