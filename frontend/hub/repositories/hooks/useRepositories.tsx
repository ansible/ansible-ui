import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../api/formatPath';
import { HubItemsResponse } from '../../useHubView';
import { Repository } from '../Repository';

export function useRepositories() {
  return useGet<HubItemsResponse<Repository>>(hubAPI`/_ui/v1/distributions/`);
}
