import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, usePageDialog, ISelected } from '../../../framework';
import { MultiSelectDialog } from '../../../framework/PageDialogs/MultiSelectDialog';
import { SelectSingleDialog } from '../../../framework/PageDialogs/SelectSingleDialog';
import { IView, ViewExtendedOptions } from '../../useView';

type BaseView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
  };

export type AsyncSelectFilterBuilderProps<T extends object> = {
  title: string;
  tableColumns: ITableColumn<T>[];
  toolbarFilters?: IToolbarFilter[];
  viewParams: ViewExtendedOptions<T>;
  useView: (viewParams: ViewExtendedOptions<T>) => BaseView<T>;
};

export function useAsyncSingleSelectFilterBuilder<T extends object>(
  props: AsyncSelectFilterBuilderProps<T>
) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  return {
    onBrowse: useCallback(
      (onSelect: (value: T) => void, defaultSelection?: T) => {
        setDialog(
          <SelectFilter<T>
            defaultSelection={defaultSelection}
            onSelect={onSelect}
            multiSelection={false}
            {...props}
          />
        );
      },
      [setDialog, t]
    ),
  };
}

export function useAsyncMultiSelectFilterBuilder<T extends object>(
  props: AsyncSelectFilterBuilderProps<T>
) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  return {
    onBrowse: useCallback(
      (onSelect: (value: T[]) => void, defaultSelection?: T[]) => {
        setDialog(
          <SelectFilter<T>
            defaultSelection={defaultSelection}
            onMultiSelect={onSelect}
            multiSelection={true}
            {...props}
          />
        );
      },
      [setDialog, t]
    ),
  };
}

function SelectFilter<T extends object>(
  props: {
    onSelect?: (item: T) => void;
    onMultiSelect?: (items: T[]) => void;
    defaultSelection?: T | T[];
    multiSelection: boolean;
  } & AsyncSelectFilterBuilderProps<T>
) {
  debugger;
  const viewParams : object = { ...props.viewParams, defaultSelection : props.defaultSelection };
  const toolbarFilters = props.toolbarFilters;
  const tableColumns = props.tableColumns;
  const view = props.useView(viewParams as ViewExtendedOptions<T>);

  if (props.multiSelection) {
    return (
      <MultiSelectDialog<T>
        {...props}
        onSelect={props.onMultiSelect ? props.onMultiSelect : () => {}}
        toolbarFilters={toolbarFilters ? toolbarFilters : []}
        tableColumns={tableColumns}
        view={view}
      />
    );
  } else {
    return (
      <SelectSingleDialog<T>
        {...props}
        onSelect={props.onSelect ? props.onSelect : () => {}}
        toolbarFilters={toolbarFilters ? toolbarFilters : []}
        tableColumns={tableColumns}
        view={view}
      />
    );
  }
}

/*

export function useSelectRepositorySingle() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  const onSelectRepository = useCallback(
    (onSelect: (value: Repository) => void, defaultSelection?: Repository) => {
      setDialog(
        <SelectRepository
          title={t('Select organization')}
          onSelect={onSelect}
          defaultRepository={defaultSelection}
          multiSelection={false}
        />
      );
    },
    [setDialog, t]
  );
  return onSelectRepository;
}

export function useSelectRepositoryMulti() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  const onSelectRepository = useCallback(
    (onSelect: (value: Repository[]) => void, defaultSelection?: Repository[]) => {
      setDialog(
        <SelectRepository
          title={t('Select organization')}
          defaultRepository={defaultSelection}
          multiSelection={true}
          onMultiselect={onSelect}
        />
      );
    },
    [setDialog, t]
  );
  return onSelectRepository;
}

function SelectRepository(props: {
  title: string;
  onSelect?: (repository: Repository) => void;
  onMultiselect?: (repository: Repository[]) => void;
  defaultRepository?: Repository | Repository[];
  multiSelection: boolean;
}) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();

  const view = usePulpView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
    defaultSelection: props.multiSelection
      ? (props.defaultRepository as Repository[])
      : [props.defaultRepository as Repository],
  });

  if (props.multiSelection) {
    return (
      <MultiSelectDialog<Repository>
        {...props}
        onSelect={props.onMultiselect ? props.onMultiselect : () => {}}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        view={view}
      />
    );
  } else {
    return (
      <SelectSingleDialog<Repository>
        {...props}
        onSelect={props.onSelect ? props.onSelect : () => {}}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        view={view}
      />
    );
  }
}



export function useRepositoryColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        value: (repo) => repo.name,
        cell: (repo) => <TextCell text={repo.name} />,
      },

      {
        header: t('Description'),
        type: 'description',
        value: (repo) => repo.description,
      },
    ],
    [t]
  );
}

export function useRepositoryFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'name',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
*/
