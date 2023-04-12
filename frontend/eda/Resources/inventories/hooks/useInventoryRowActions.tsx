import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoryRowActions(view: IEdaView<EdaInventory>) {
  const { t } = useTranslation();
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);
  const rowActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.Single,
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
