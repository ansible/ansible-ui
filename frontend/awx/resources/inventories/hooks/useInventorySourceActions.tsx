import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteInventorySources } from './useDeleteInventorySources';

type InventorySourceActionOptions = {
  onInventorySourcesDeleted: (inventorySources: InventorySource[]) => void;
};

export function useInventorySourceActions({
  onInventorySourcesDeleted,
}: InventorySourceActionOptions) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteInventorySources = useDeleteInventorySources(onInventorySourcesDeleted);
  const params = useParams<{ inventory_type: string }>();

  const { activeAwxUser } = useAwxActiveUser();
  const alertToaster = usePageAlertToaster();

  const postRequest = usePostRequest();
  const handleUpdate = useCallback(
    async (invSrc: InventorySource) => {
      try {
        await postRequest(awxAPI`/inventory_sources/${invSrc.id.toString()}/update/`, {});
      } catch (error) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to update inventory source'),
          children: error instanceof Error && error.message,
          timeout: 5000,
        });
      }
    },
    [alertToaster, postRequest, t]
  );

  return useMemo<IPageAction<InventorySource>[]>(() => {
    const cannotDeleteInventorySource = (inventorySource: InventorySource): string => {
      if (inventorySource?.status === 'running') {
        return t(`The inventory source cannot be deleted due to the source currently running`);
      }

      if (
        !inventorySource?.summary_fields?.user_capabilities?.delete &&
        !activeAwxUser?.is_system_auditor
      ) {
        return t(`The inventory source cannot be deleted due to insufficient permission`);
      }

      return '';
    };
    const cannotEditInventorySource = (inventorySource: InventorySource): string =>
      inventorySource?.summary_fields?.user_capabilities?.edit && !activeAwxUser?.is_system_auditor
        ? ''
        : t(`The inventory source cannot be edited due to insufficient permission`);
    const cannotLaunchInventorySourceUpdate = (inventorySource: InventorySource): string => {
      return inventorySource.summary_fields.user_capabilities.start &&
        !activeAwxUser?.is_system_auditor
        ? ''
        : t(`The inventory source cannot be updated due to insufficient permission`);
    };
    const itemActions: IPageAction<InventorySource>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit inventory source'),
        isDisabled: (inventorySource: InventorySource) =>
          cannotEditInventorySource(inventorySource),
        onClick: (inventorySource) =>
          pageNavigate(AwxRoute.InventorySourceEdit, {
            params: {
              id: inventorySource.inventory,
              inventory_type: params.inventory_type,
              source_id: inventorySource.id,
            },
          }),
      },

      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch inventory update'),
        isPinned: true,
        isHidden: (inventorySource: InventorySource) =>
          !inventorySource?.summary_fields.user_capabilities.start,
        isDisabled: (inventorySource: InventorySource) =>
          cannotLaunchInventorySourceUpdate(inventorySource),
        onClick: (inventorySource) => handleUpdate(inventorySource),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete inventory source'),
        isDisabled: (inventorySource: InventorySource) =>
          cannotDeleteInventorySource(inventorySource),
        onClick: (inventorySource) => deleteInventorySources([inventorySource]),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [deleteInventorySources, pageNavigate, handleUpdate, activeAwxUser, t, params.inventory_type]);
}
