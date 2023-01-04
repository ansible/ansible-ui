import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
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
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns';
import { RouteE } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/controller-toolbar-filters';
import { useControllerView } from '../../useControllerView';
import { Inventory } from './Inventory';
import { useDeleteInventories } from './useDeleteInventories';

export function Inventories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns();
  const view = useControllerView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
  });
  const deleteInventories = useDeleteInventories(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Inventory>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create inventory'),
        onClick: () => navigate(RouteE.CreateInventory),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected inventories'),
        onClick: deleteInventories,
      },
    ],
    [navigate, deleteInventories, t]
  );

  const rowActions = useMemo<IPageAction<Inventory>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit inventory'),
        onClick: (inventory) =>
          navigate(RouteE.EditInventory.replace(':id', inventory.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory) => deleteInventories([inventory]),
      },
    ],
    [navigate, deleteInventories, t]
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
        emptyStateDescription={t('To get started, create an inventory.')}
        emptyStateButtonText={t('Create inventory')}
        emptyStateButtonClick={() => navigate(RouteE.CreateInventory)}
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
    (inventory: Inventory) =>
      navigate(RouteE.InventoryDetails.replace(':id', inventory.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Inventory>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
