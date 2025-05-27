import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, PencilAltIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventoryWithSource } from '../InventoryPage/InventoryDetails';
import { useCopyInventory } from './useCopyInventory';
import { useDeleteInventories } from './useDeleteInventories';

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

  const [updateJobId, setUpdateJobId] = useState<number | undefined>(undefined);
  // for faster UI change
  const [hideCancelButton, setHideCancelButton] = useState<boolean | undefined>(undefined);

  const params = useParams<{ inventory_type: string }>();

  const alertToaster = usePageAlertToaster();

  const cancelSync = useCallback(async () => {
    try {
      await postRequest(
        awxAPI`/inventory_updates/${updateJobId?.toString() || ''}/cancel/`,
        undefined
      );
      setHideCancelButton(true);
    } catch (error) {
      if (error?.toString() === 'SyntaxError: Unexpected end of JSON input') {
        return;
      }

      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to cancel inventory source'),
        children: error instanceof Error && error.message,
        timeout: 5000,
      });
    }
  }, [alertToaster, t, updateJobId]);

  const startSync = useCallback(
    async (inventory: InventoryWithSource) => {
      try {
        const response = await postRequest<{ inventory_update: number }>(
          awxAPI`/inventory_sources/${inventory.source?.id.toString() || ''}/update/`,
          {}
        );
        setUpdateJobId(response.inventory_update);
        setHideCancelButton(false);
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
        return t(`The inventory cannot be duplicated due to insufficient permission`);
      } else if (inventory?.has_inventory_sources) {
        return t(`Inventories with sources cannot be duplicated`);
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
        label: t('Duplicate inventory'),
        isDisabled: (inventory: Inventory) => cannotCopyInventory(inventory),
        onClick: (inventory: Inventory) => copyInventory(inventory),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncIcon,
        isPinned: true,
        label: t('Sync inventory'),
        isDisabled: (inventory: InventoryWithSource) => cannotSyncInventory(inventory),
        onClick: (inventory: InventoryWithSource) => startSync(inventory),
        isHidden: (inventory) =>
          !(
            params.inventory_type === 'constructed_inventory' &&
            detail === true &&
            (isSyncRunning(inventory) !== true || hideCancelButton === true)
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncIcon,
        isPinned: true,
        label: t('Cancel Sync'),
        isDisabled: (inventory: InventoryWithSource) => cannotSyncInventory(inventory),
        onClick: () => cancelSync(),
        isHidden: (inventory) =>
          !(
            params.inventory_type === 'constructed_inventory' &&
            detail === true &&
            isSyncRunning(inventory) === true &&
            updateJobId !== undefined &&
            hideCancelButton !== true
          ),
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
    cancelSync,
    startSync,
    hideCancelButton,
    updateJobId,
  ]);
}

function isSyncRunning(inventory: InventoryWithSource) {
  const inventorySourceSyncJob =
    inventory?.source?.summary_fields?.current_job ||
    inventory?.source?.summary_fields?.last_job ||
    undefined;

  let syncRunning = undefined;
  if (inventorySourceSyncJob) {
    const status = inventorySourceSyncJob.status;
    syncRunning =
      status === 'pending' || status === 'running' || status === 'waiting' ? true : false;
  }

  return syncRunning;
}
