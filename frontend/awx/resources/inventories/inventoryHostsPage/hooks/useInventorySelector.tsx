import { useTranslation } from 'react-i18next';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncSingleSelectFilterBuilder,
} from '../../../../../hub/common/ToolbarAsyncSelectFilterBuilder';

import { QueryParams, useAwxView } from '../../../../common/useAwxView';

import { Inventory } from '../../../../interfaces/Inventory';
import { useInventoriesColumns } from '../../hooks/useInventoriesColumns';
import { useInventoriesFilters } from '../../hooks/useInventoriesFilters';

import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../../framework';
import { awxAPI } from '../../../../common/api/awx-utils';

function useParameters(queryParams: QueryParams): AsyncSelectFilterBuilderProps<Inventory> {
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
      queryParams,
    },
  };
}

export function useSelectInventorySingle(queryParams: QueryParams) {
  const params = useParameters(queryParams);

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
