import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { type WebSocketInventory } from '../Inventories';

export function useInventoriesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const { t } = useTranslation();

  const nameClick = useCallback(
    (inventory: Inventory) => {
      const kinds: { [key: string]: string } = {
        '': 'inventory',
        smart: 'smart_inventory',
        constructed: 'constructed_inventory',
      };
      return pageNavigate(AwxRoute.InventoryDetails, {
        params: { inventory_type: kinds[inventory.kind], id: inventory.id },
      });
    },
    [pageNavigate]
  );
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const createdColumn = useCreatedColumn(options);
  const descriptionColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
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
      dashboard: 'hidden',
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
