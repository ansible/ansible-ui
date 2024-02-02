import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell, ToolbarFilterType } from '../../../../framework';
import {
  useAsyncSingleSelectFilterBuilder,
  AsyncSelectFilterBuilderProps,
} from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { hubAPI } from './../../common/api/formatPath';
import { useHubView } from '../../common/useHubView';
import { HubNamespace } from '../../namespaces/HubNamespace';

function useParameters(): AsyncSelectFilterBuilderProps<HubNamespace> {
  const tableColumns = useNamespaceColumns();
  const toolbarFilters = useNamespaceFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Namespace`,
    tableColumns,
    toolbarFilters,
    useView: useHubView,
    viewParams: {
      url: hubAPI`/_ui/v1/my-namespaces/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn: (item) => item?.name,
    },
  };
}

export function useSelectNamespaceSingle() {
  const params2 = useParameters();
  return useAsyncSingleSelectFilterBuilder<HubNamespace>(params2);
}

export function useNamespaceColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<HubNamespace>[]>(
    () => [
      {
        header: t('Name'),
        value: (namespace) => namespace.name,
        cell: (namespace) => <TextCell text={namespace.name} />,
      },
    ],
    [t]
  );
}

export function useNamespaceFilters() {
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
