import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { StatusCell } from '../../../../common/StatusCell';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
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
  const descriptionColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);
  const organizationColumn = useOrganizationNameColumn(options);
  const typeColumn = useMemo<ITableColumn<Inventory>>(
    () => ({
      header: t('Type'),
      type: 'text',
      value: (inventory: Inventory) => {
        switch (inventory.kind) {
          case 'smart':
            return t('Smart inventory');
          case 'constructed':
            return t('Constructed inventory');
          default:
            return t('Inventory');
        }
      },
      card: 'subtitle',
      list: 'subtitle',
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
    () => [
      nameColumn,
      descriptionColumn,
      statusColumn,
      typeColumn,
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [
      nameColumn,
      descriptionColumn,
      statusColumn,
      typeColumn,
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ]
  );
  return tableColumns;
}
