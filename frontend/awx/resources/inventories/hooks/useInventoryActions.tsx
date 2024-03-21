import { ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
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
  const pageNavigate = usePageNavigate();
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

    const kinds: { [key: string]: string } = {
      '': 'inventory',
      smart: 'smart_inventory',
      constructed: 'constructed_inventory',
    };

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit inventory'),
        isDisabled: (inventory: Inventory) => cannotEditInventory(inventory),
        onClick: (inventory) =>
          pageNavigate(AwxRoute.EditInventory, {
            params: { inventory_type: kinds[inventory.kind], id: inventory.id },
          }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CopyIcon,
        label: t('Copy inventory'),
        isDisabled: (inventory: Inventory) => cannotCopyInventory(inventory),
        onClick: (inventory: Inventory) => copyInventory(inventory),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        isDisabled: (inventory: Inventory) => cannotDeleteInventory(inventory),
        onClick: (inventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ];
  }, [deleteInventories, copyInventory, pageNavigate, t]);
}
