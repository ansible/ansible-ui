import { ITableColumn, usePageNavigate } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useLabelsColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '@ansible/common-ui/columns';
import { Tooltip } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const labelsColumn = useLabelsColumn();
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

        let tooltip = '';
        if (inventory.has_inventory_sources) {
          tooltip = t`No inventory sync failures`;
        } else {
          tooltip = t`Not configured for inventory sync.`;
        }

        if (!tooltip) {
          return <StatusCell status={syncStatus} />;
        }

        return (
          <Tooltip content={tooltip} position="top">
            <StatusCell status={syncStatus} />
          </Tooltip>
        );
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
      labelsColumn,
      {
        header: t('Hosts'),
        type: 'count',
        value: (inventory: Inventory) => {
          return inventory.total_hosts;
        },
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Host failures'),
        type: 'count',
        value: (inventory: Inventory) => {
          return inventory.hosts_with_active_failures === 0
            ? undefined
            : inventory.hosts_with_active_failures;
        },
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Groups'),
        type: 'count',
        value: (inventory: Inventory) => {
          return inventory.total_groups === 0 ? undefined : inventory.total_groups;
        },
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Sources'),
        type: 'count',
        value: (inventory: Inventory) => {
          return inventory.total_inventory_sources === 0
            ? undefined
            : inventory.total_inventory_sources;
        },
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Source Failures'),
        type: 'count',
        value: (inventory: Inventory) => {
          return inventory.inventory_sources_with_failures === 0
            ? undefined
            : inventory.inventory_sources_with_failures;
        },
        modal: 'hidden',
        dashboard: 'hidden',
      },
      createdColumn,
      modifiedColumn,
    ],
    [
      nameColumn,
      descriptionColumn,
      statusColumn,
      typeColumn,
      organizationColumn,
      labelsColumn,
      t,
      createdColumn,
      modifiedColumn,
    ]
  );
  return tableColumns;
}
