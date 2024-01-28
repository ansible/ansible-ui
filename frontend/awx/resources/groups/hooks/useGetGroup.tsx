import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxGroup } from '../../../interfaces/AwxGroup';

export function useGetGroup(group_id: string) {
  const { data: group, refresh } = useGetItem<AwxGroup>(awxAPI`/groups`, group_id);
  return { group, refresh };
}
