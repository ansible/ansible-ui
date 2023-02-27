import { useGet } from '../../../../common/useItem';
import { GalaxyItemsResponse } from '../../../useGalaxyView';
import { Collection } from '../Collection';

export function useCollections() {
  const t = useGet<GalaxyItemsResponse<Collection>>('/api/automation-hub/_ui/v1/repo/published/');
  return t.data?.data;
}
