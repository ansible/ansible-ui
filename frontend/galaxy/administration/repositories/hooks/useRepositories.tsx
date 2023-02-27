import { useGet } from '../../../../common/useItem';
import { HubItemsResponse } from '../../../useGalaxyView';
import { Repository } from '../Repository';

export function useRepositories() {
  const t = useGet<HubItemsResponse<Repository>>('/api/automation-hub/_ui/v1/distributions/');
  return t.data?.data;
}
