import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell, ToolbarFilterType } from '../../../../framework';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { hubAPI } from '../../common/api/formatPath';
import { useHubView } from '../../common/useHubView';

function useParameters(): AsyncSelectFilterBuilderProps<Registry> {
  const tableColumns = useRegistryColumns();
  const toolbarFilters = useRegistryFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Registry`,
    tableColumns,
    toolbarFilters,
    useView: useHubView,
    viewParams: {
      url: hubAPI`/_ui/v1/execution-environments/registries/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn: (item) => item?.name,
    },
  };
}

export function useSelectRegistryMulti() {
  const params = useParameters();

  return useAsyncMultiSelectFilterBuilder<Registry>(params);
}

export function useSelectRegistrySingle() {
  const params = useParameters();

  return useAsyncSingleSelectFilterBuilder<Registry>(params);
}

export function useRegistryColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Registry>[]>(
    () => [
      {
        header: t('Name'),
        value: (registry) => registry.name,
        cell: (registry) => <TextCell text={registry.name} />,
      },
    ],
    [t]
  );
}

export function useRegistryFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: 'name',
        comparison: 'equals',
      },
    ],
    [t]
  );
}

type Registry = {
  id: string;
  name: string;
};
