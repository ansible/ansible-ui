import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { Repository } from '../Repository';
import { hubAPI } from '../../api';

export function useRepositories() {
  const t = useGet<HubItemsResponse<Repository>>(hubAPI`/_ui/v1/distributions/`);
  return t.data?.data;
}
