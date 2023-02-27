import { useGet } from '../../../../common/useItem';
import { GalaxyItemsResponse } from '../../../useGalaxyView';
import { Repository } from '../Repository';

export function useRepositories() {
  const t = useGet<GalaxyItemsResponse<Repository>>('/api/automation-hub/_ui/v1/distributions/');
  return t.data?.data;
}
