import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { AwxRoute } from '../../../AwxRoutes';
import { Inventory } from '../../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { IAwxView } from '../../../useAwxView';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoriesToolbarActions(view: IAwxView<Inventory>) {
  const { t } = useTranslation();
  const paegNavigate = usePageNavigate();
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/inventories/');
  const canCreateInventory = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<Inventory>[]>(() => {
    const actions: IPageAction<Inventory>[] = [
      {
        type: PageActionType.Dropdown,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create inventory'),
        isDisabled: () =>
          canCreateInventory
            ? undefined
            : t(
                'You do not have permission to create an inventory. Please contact your organization administrator if there is an issue with your access.'
              ),
        selection: PageActionSelection.None,
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create inventory'),
            onClick: () => paegNavigate(AwxRoute.CreateInventory),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create smart inventory'),
            onClick: () => paegNavigate(AwxRoute.CreateSmartInventory),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create constructed inventory'),
            onClick: () => paegNavigate(AwxRoute.CreateConstructedInventory),
          },
        ],
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: deleteInventories,
        isDanger: true,
      },
    ];

    return actions;
  }, [canCreateInventory, deleteInventories, paegNavigate, t]);
}
