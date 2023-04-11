import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
        type: PageActionType.dropdown,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create inventory'),
        options: [
          {
            type: PageActionType.button,
            label: t('Create inventory'),
            onClick: () => navigate(RouteObj.CreateInventory),
          },
          {
            type: PageActionType.button,
            label: t('Create smart inventory'),
            onClick: () => navigate(RouteObj.CreateSmartInventory),
          },
          {
            type: PageActionType.button,
            label: t('Create constructed inventory'),
            onClick: () => navigate(RouteObj.CreateConstructedInventory),
          },
        ],
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: deleteInventories,
        isDanger: true,
      },
    ],
    [deleteInventories, navigate, t]
  );
}
