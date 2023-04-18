import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { IAwxView } from '../../../useAwxView';
import { useDeleteInventories } from './useDeleteInventories';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useOptions } from '../../../../common/crud/useOptions';

export function useInventoriesToolbarActions(view: IAwxView<Inventory>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
                'You do not have permission to create an inventory. Please contact your Organization Administrator if there is an issue with your access.'
              ),
        selection: PageActionSelection.None,
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create inventory'),
            onClick: () => navigate(RouteObj.CreateInventory),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create smart inventory'),
            onClick: () => navigate(RouteObj.CreateSmartInventory),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.None,
            label: t('Create constructed inventory'),
            onClick: () => navigate(RouteObj.CreateConstructedInventory),
          },
        ],
      },
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
  }, [canCreateInventory, deleteInventories, navigate, t]);
}
