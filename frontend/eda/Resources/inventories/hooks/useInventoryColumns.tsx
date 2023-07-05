import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { EdaInventory } from '../../../interfaces/EdaInventory';

export function useInventoriesColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<EdaInventory>[]>(
    () => [
      {
        header: t('ID'),
        cell: (inventory) => inventory.id,
        card: 'hidden',
        list: 'hidden',
      },
      {
        header: t('Name'),
        cell: (inventory) => (
          <TextCell
            text={inventory.name}
            // onClick={() =>
            //   navigate(RouteObj.EdaInventoryDetails.replace(':id', inventory.id.toString()))
            // }
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (inventory) => inventory.description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Source of Inventory'),
        cell: (inventory) =>
          inventory?.inventory_source && <TextCell text={inventory.inventory_source} />,
      },
    ],
    [t]
  );
  return tableColumns;
}
