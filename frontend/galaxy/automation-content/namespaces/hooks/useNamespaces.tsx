import { useGet } from '../../../../common/useItem';
import { GalaxyItemsResponse } from '../../../useGalaxyView';
import { Namespace } from '../Namespace';

export function useNamespaces() {
  const t = useGet<GalaxyItemsResponse<Namespace>>('/api/automation-hub/_ui/v1/namespaces/');
  return t.data?.data;
}
