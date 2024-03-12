import { useTranslation } from 'react-i18next';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncSingleSelectFilterBuilder,
} from '../../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';

import { useAwxView } from '../../../../common/useAwxView';

import { useInventoriesColumns } from '../../hooks/useInventoriesColumns';
import { useInventoriesFilters } from '../../hooks/useInventoriesFilters';
import { Inventory } from '../../../../interfaces/Inventory';

import { awxAPI } from '../../../../common/api/awx-utils';
import { useMemo } from 'react';
import { ITableColumn } from '../../../../../../framework';
import { TextCell } from '../../../../../../framework';

function useParameters(): AsyncSelectFilterBuilderProps<Inventory> {
  const tableColumns = useInventoriesColumns();
  const toolbarFilters = useInventoriesFilters();

  const { t } = useTranslation();

  return {
    title: t`Select Inventory`,
    tableColumns,
    useView: useAwxView,
    toolbarFilters,
    viewParams: {
      url: awxAPI`/inventories/`,
      toolbarFilters,
      tableColumns,
      keyFn: (item) => item?.name,
    },
  };
}

export function useSelectInventorySingle() {
  const params = useParameters();

  return useAsyncSingleSelectFilterBuilder<Inventory>(params);
}

export function useColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Inventory>[]>(
    () => [
      {
        header: t('Name'),
        value: (inventory) => inventory.name,
        cell: (inventory) => <TextCell text={inventory.name} />,
      },
    ],
    [t]
  );
}
