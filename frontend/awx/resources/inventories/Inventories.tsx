import { TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../common/columns';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { RouteObj } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { Inventory } from '../../interfaces/Inventory';
import { useAwxView } from '../../useAwxView';
import { useDeleteInventories } from './hooks/useDeleteInventories';

export function Inventories() {
  const { t } = useTranslation();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns();
  const view = useAwxView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
  });
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Inventory>[]>(
    () => [
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: deleteInventories,
        isDanger: true,
      },
    ],
    [deleteInventories, t]
  );

  const rowActions = useMemo<IPageAction<Inventory>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory) => deleteInventories([inventory]),
        isDanger: true,
      },
    ],
    [deleteInventories, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Inventories')}
        titleHelpTitle={t('Inventories')}
        titleHelp={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/inventories.html"
        description={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
      />
      <PageTable<Inventory>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventories')}
        emptyStateTitle={t('No inventories yet')}
        expandedRow={ItemDescriptionExpandedRow<Inventory>}
        {...view}
      />
    </PageLayout>
  );
}

export function useInventoriesFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}

export function useInventoriesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate();

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
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Inventory>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
