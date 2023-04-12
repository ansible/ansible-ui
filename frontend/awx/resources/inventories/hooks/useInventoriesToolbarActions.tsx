import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { IAwxView } from '../../../useAwxView';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoriesToolbarActions(view: IAwxView<Inventory>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<Inventory>[]>(
    () => [
      {
        type: PageActionType.Dropdown,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create inventory'),
        actions: [
          {
            type: PageActionType.Button,
            label: t('Create inventory'),
            onClick: () => navigate(RouteObj.CreateInventory),
          },
          {
            type: PageActionType.Button,
            label: t('Create smart inventory'),
            onClick: () => navigate(RouteObj.CreateSmartInventory),
          },
          {
            type: PageActionType.Button,
            label: t('Create constructed inventory'),
            onClick: () => navigate(RouteObj.CreateConstructedInventory),
          },
        ],
      },
      {
        type: PageActionType.Bulk,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: deleteInventories,
        isDanger: true,
      },
    ],
    [deleteInventories, navigate, t]
  );
}
