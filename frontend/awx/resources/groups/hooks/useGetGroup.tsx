import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

export function useGetGroup(group_id: string) {
  const { data: group, refresh } = useGetItem<InventoryGroup>(awxAPI`/groups`, group_id);
  return { group, refresh };
}
