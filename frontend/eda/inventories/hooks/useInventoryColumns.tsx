import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn, TextCell } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaInventory } from '../../interfaces/EdaInventory';

export function useInventoriesColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useMemo<ITableColumn<EdaInventory>[]>(
    () => [
      {
        header: t('ID'),
        cell: (inventory) => inventory.id,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
      },
      {
        header: t('Name'),
        cell: (inventory) => (
          <TextCell
            text={inventory.name}
            onClick={() =>
              navigate(RouteE.EdaInventoryDetails.replace(':id', inventory.id.toString()))
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (inventory) => inventory.description,
        card: 'description',
        list: 'description',
      },
    ],
    [navigate, t]
  );
  return tableColumns;
}
