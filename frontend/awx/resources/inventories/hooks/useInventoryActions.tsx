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
import { InventoryWithSource } from '../InventoryPage/InventoryDetails';
import { usePageAlertToaster } from '../../../../../framework';
import { useCallback } from 'react';
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

type InventoryActionOptions = {
  onInventoriesDeleted: (inventories: Inventory[]) => void;
  onInventoryCopied?: () => unknown;
  detail: boolean;
};

export function useInventoryActions({
  onInventoriesDeleted,
  onInventoryCopied = () => null,
  detail,
}: InventoryActionOptions) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteInventories = useDeleteInventories(onInventoriesDeleted);
  const copyInventory = useCopyInventory(onInventoryCopied);

  const params = useParams<{ inventory_type: string }>();

  const alertToaster = usePageAlertToaster();

  const handleUpdate = useCallback(
    async (inventory: InventoryWithSource) => {
      try {
        await postRequest(
          awxAPI`/inventory_sources/${inventory.source?.id.toString() || ''}/update/`,
          {}
        );
        alertToaster.addAlert({
          variant: 'info',
          title: t('Inventory sync started'),
          children: t('Running sync on {{name}}. Progress shown on details tab.', {
            name: inventory.name,
          }),
          timeout: 5000,
        });
      } catch (error) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to update inventory source'),
          children: error instanceof Error && error.message,
          timeout: 5000,
        });
      }
    },
    [alertToaster, t]
  );

  return useMemo<IPageAction<InventoryWithSource>[]>(() => {
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

    const cannotSyncInventory = (inventory: InventoryWithSource): string =>
      inventory?.source?.summary_fields?.user_capabilities?.start
        ? ''
        : t(`The inventory cannot be synced due to insufficient permission`);

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
        onClick: (inventory: Inventory) =>
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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncIcon,
        label: t('Sync inventory'),
        isDisabled: (inventory: InventoryWithSource) => cannotSyncInventory(inventory),
        onClick: (inventory: InventoryWithSource) => handleUpdate(inventory),
        isHidden: () => !(params.inventory_type === 'constructed_inventory' && detail === true),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        isDisabled: (inventory: Inventory) => cannotDeleteInventory(inventory),
        onClick: (inventory: Inventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ];
  }, [
    deleteInventories,
    copyInventory,
    pageNavigate,
    t,
    params.inventory_type,
    detail,
    handleUpdate,
  ]);
}
