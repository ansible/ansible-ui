import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteInventories } from './useDeleteInventories';

export function useInventoriesToolbarActions(view: IEdaView<EdaInventory>) {
  const { t } = useTranslation();
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<EdaInventory>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: (inventories: EdaInventory[]) => deleteInventories(inventories),
        isDanger: true,
      },
    ],
    [deleteInventories, t]
  );
  return toolbarActions;
}
