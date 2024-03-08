import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxHost } from '../../../interfaces/AwxHost';

export function useGetHost(host_id: string) {
  const { data: host, refresh, error } = useGetItem<AwxHost>(awxAPI`/hosts`, host_id.toString());
  return { host, refresh, error };
}
