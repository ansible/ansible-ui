import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoriesToolbarActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteInventories = useDeleteInventories(() => void refresh());
  const toolbarActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create inventory'),
        onClick: () => navigate(RouteE.CreateEdaInventory),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: (inventories: EdaInventory[]) => deleteInventories(inventories),
        isDanger: true,
      },
    ],
    [deleteInventories, navigate, t]
  );
  return toolbarActions;
}
