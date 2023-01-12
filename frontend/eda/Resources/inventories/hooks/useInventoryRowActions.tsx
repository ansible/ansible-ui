import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoryRowActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteInventories = useDeleteInventories(() => void refresh());
  const rowActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit inventory'),
        onClick: (inventory: EdaInventory) =>
          navigate(RouteE.EditEdaInventory.replace(':id', inventory.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory: EdaInventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ],
    [deleteInventories, navigate, t]
  );
  return rowActions;
}
