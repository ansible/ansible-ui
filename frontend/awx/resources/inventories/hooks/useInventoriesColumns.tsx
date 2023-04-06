import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useOrganizationNameColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../common/columns';
import { StatusCell } from '../../../../common/StatusCell';
import { RouteObj } from '../../../../Routes';
import { Inventory } from '../../../interfaces/Inventory';
import { type WebSocketInventory } from '../Inventories';

export function useInventoriesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const nameClick = useCallback(
    (inventory: Inventory) => {
      const kinds: { [key: string]: string } = {
        '': 'inventory',
        smart: 'smart_inventory',
        constructed: 'constructed_inventory',
      };
      return navigate(
        RouteObj.InventoryDetails.replace(':inventory_type', kinds[inventory.kind]).replace(
          ':id',
          inventory.id.toString()
        )
      );
    },
    [navigate]
  );
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const organizationColumn = useOrganizationNameColumn(options);
  const typeColumn = useMemo<ITableColumn<Inventory>>(
    () => ({
      header: t('Type'),
      type: 'text',
      value: (inventory: Inventory) => {
        switch (inventory.kind) {
          case 'smart':
            return t('Smart Inventory');
          case 'constructed':
            return t('Constructed Inventory');
          default:
            return t('Inventory');
        }
      },
    }),
    [t]
  );
  const statusColumn = useMemo<ITableColumn<Inventory>>(
    () => ({
      header: t('Status'),
      cell: (inventory: Inventory) => {
        if (inventory.kind !== '') {
          return null;
        }
        let syncStatus = 'disabled';
        if (inventory.has_inventory_sources) {
          if (inventory.inventory_sources_with_failures) {
            syncStatus = 'error';
          } else {
            syncStatus = 'successful';
          }
          if ('status' in inventory) {
            syncStatus = (inventory as WebSocketInventory).status;
          }
        }
        return <StatusCell status={syncStatus} />;
      },
    }),
    [t]
  );
  const tableColumns = useMemo<ITableColumn<Inventory>[]>(
    () => [nameColumn, statusColumn, typeColumn, organizationColumn, createdColumn, modifiedColumn],
    [nameColumn, statusColumn, typeColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
