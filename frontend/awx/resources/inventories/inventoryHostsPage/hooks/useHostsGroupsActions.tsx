import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../../framework';
import { cannotEditResource } from '../../../../../common/utils/RBAChelpers';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { useGetItem } from '../../../../../common/crud/useGet';
import { Inventory } from '../../../../interfaces/generated-from-swagger/api';
import { awxAPI } from '../../../../common/api/awx-utils';

export function useHostsGroupsActions(inventoryId: string) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const { data: inventory } = useGetItem<Inventory>(awxAPI`/inventories/`, inventoryId);
  const inventoryType = inventory?.type;

  return useMemo<IPageAction<InventoryGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit group'),
        onClick: (group) =>
          pageNavigate(AwxRoute.InventoryGroupEdit, {
            params: { inventory_type: inventoryType, id: inventoryId, group_id: group.id },
          }),
        isDisabled: (group) => cannotEditResource(group, t),
      },
    ],
    [t, pageNavigate, inventoryId, inventoryType]
  );
}
