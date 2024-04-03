import { ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
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
import { useParams } from 'react-router-dom';

type InventoryActionOptions = {
  onInventoriesDeleted: (inventories: Inventory[]) => void;
  onInventoryCopied?: () => unknown;
  detail : boolean;
};

export function useInventoryActions({
  onInventoriesDeleted,
  onInventoryCopied = () => null,
  detail
}: InventoryActionOptions) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteInventories = useDeleteInventories(onInventoriesDeleted);
  const copyInventory = useCopyInventory(onInventoryCopied);
  const params = useParams<{inventory_type : string}>();

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
    /*const cannotSyncRepository = (inventory: Inventory): string =>
    inventory?.summary_fields?.user_capabilities?.sync
      ? ''
      : t(`The inventory cannot be edited due to insufficient permission`);
    */

    const kinds: { [key: string]: string } = {
      '': 'inventory',
      smart: 'smart_inventory',
      constructed: 'constructed_inventory',
    };

    const arr : (IPageAction<Inventory> | undefined)[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit inventory'),
        isDisabled: (inventory: Inventory) => cannotEditInventory(inventory),
        onClick: (inventory : Inventory) =>
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
      params.inventory_type === 'constructed_inventory' ? {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncIcon,
        label: t('Sync inventory'),
        onClick: (inventory: Inventory) => {},
      } : undefined,
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        isDisabled: (inventory: Inventory) => cannotDeleteInventory(inventory),
        onClick: (inventory : Inventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ];

    return arr.filter( (item) => item !== undefined) as IPageAction<Inventory>[];
  }, [deleteInventories, copyInventory, pageNavigate, t]);
}
