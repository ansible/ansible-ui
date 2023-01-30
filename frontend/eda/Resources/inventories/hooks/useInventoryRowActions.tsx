import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoryRowActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const deleteInventories = useDeleteInventories(() => void refresh());
  const rowActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory: EdaInventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ],
    [deleteInventories, t]
  );
  return rowActions;
}
