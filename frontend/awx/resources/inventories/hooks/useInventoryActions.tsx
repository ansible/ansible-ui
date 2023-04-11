import { CopyIcon, EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { useCopyInventory } from './useCopyInventory';
import { useDeleteInventories } from './useDeleteInventories';

type InventoryActionOptions = {
  onInventoriesDeleted: (inventories: Inventory[]) => void;
  onInventoryCopied?: () => unknown;
};

export function useInventoryActions({
  onInventoriesDeleted,
  onInventoryCopied = () => null,
}: InventoryActionOptions) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteInventories = useDeleteInventories(onInventoriesDeleted);
  const copyInventory = useCopyInventory(onInventoryCopied);

  return useMemo<IPageAction<Inventory>[]>(() => {
    const cannotDeleteInventory = (inventory: Inventory): string =>
      inventory?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The inventory cannot be deleted due to insufficient permission`);
    const cannotEditInventory = (inventory: Inventory): string =>
      inventory?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The inventory cannot be edited due to insufficient permission`);
    const cannotCopyInventory = (inventory: Inventory): string => {
      if (!inventory?.summary_fields?.user_capabilities?.copy) {
        return t(`The inventory cannot be copied due to insufficient permission`);
      } else if (inventory?.has_inventory_sources) {
        return t(`Inventories with sources cannot be copied`);
      } else {
        return '';
      }
    };

    return [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit inventory'),
        isDisabled: (inventory: Inventory) => cannotEditInventory(inventory),
        onClick: (inventory) =>
          navigate(RouteObj.EditInventory.replace(':id', inventory.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: CopyIcon,
        label: t('Copy inventory'),
        isDisabled: (inventory: Inventory) => cannotCopyInventory(inventory),
        onClick: (inventory: Inventory) => copyInventory(inventory),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        isDisabled: (inventory: Inventory) => cannotDeleteInventory(inventory),
        onClick: (inventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ];
  }, [deleteInventories, copyInventory, navigate, t]);
}
