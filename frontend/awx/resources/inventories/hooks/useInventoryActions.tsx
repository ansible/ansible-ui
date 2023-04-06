import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { CopyIcon, EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType, usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoryActions(options: {
  onInventoriesDeleted: (inventories: Inventory[]) => void;
}) {
  const { onInventoriesDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const deleteInventories = useDeleteInventories(onInventoriesDeleted);
  const alertToaster = usePageAlertToaster();

  return useMemo<IPageAction<Inventory>[]>(() => {
    const cannotDeleteInventory = (inventory: Inventory) =>
      inventory?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The inventory cannot be deleted due to insufficient permission`);
    const cannotEditInventory = (inventory: Inventory) =>
      inventory?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The inventory cannot be edited due to insufficient permission`);
    const cannotCopyInventory = (inventory: Inventory) =>
      inventory?.summary_fields?.user_capabilities?.copy
        ? ''
        : t(`The inventory cannot be copied due to insufficient permission`);

    return [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
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
        onClick: (inventory: Inventory) => {
          const alert: AlertProps = {
            variant: 'success',
            title: t(`${inventory.name} copied.`),
            timeout: 2000,
          };
          postRequest(`/api/v2/inventories/${inventory?.id ?? 0}/copy/`, {
            name: `${inventory.name} @ ${new Date()
              .toTimeString()
              .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
          })
            .then(() => {
              alertToaster.addAlert(alert);
            })
            .catch((error) => {
              alertToaster.replaceAlert(alert, {
                variant: 'danger',
                title: t('Failed to copy inventory'),
                children: error instanceof Error && error.message,
              });
            });
        },
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
  }, [alertToaster, deleteInventories, navigate, postRequest, t]);
}
