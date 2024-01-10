import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { HubItemsResponse } from '../../../common/useHubView';
import { Repository } from '../Repository';

export function useRepositories() {
  return useGet<HubItemsResponse<Repository>>(hubAPI`/_ui/v1/distributions/`);
}
