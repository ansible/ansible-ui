import { useCallback } from 'react';
import { ISelected, ITableColumn, IToolbarFilter, usePageDialogs } from '../../../framework';
import { MultiSelectDialog } from '../../../framework/PageDialogs/MultiSelectDialog';
import { SingleSelectDialog } from '../../../framework/PageDialogs/SingleSelectDialog';
import { IView, ViewExtendedOptions } from '../../../framework/useView';
import { MultiDialogs } from '../administration/repositories/hooks/useAddCollections';

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
  multiDialogs?: MultiDialogs;
};

export function useAsyncSingleSelectFilterBuilder<T extends object>(
  props: AsyncSelectFilterBuilderProps<T>
) {
  let { pushDialog } = usePageDialogs();
  if (props.multiDialogs?.pushDialog) {
    pushDialog = props.multiDialogs.pushDialog;
  }

  return {
    openBrowse: useCallback(
      (onSelect: (value: T) => void, defaultSelection?: T) => {
        pushDialog(
          <SelectFilter<T>
            defaultSelection={defaultSelection}
            onSelect={onSelect}
            multiSelection={false}
            {...props}
          />
        );
      },
      [pushDialog, props]
    ),
  };
}

export function useAsyncMultiSelectFilterBuilder<T extends object>(
  props: AsyncSelectFilterBuilderProps<T>
) {
  let { pushDialog } = usePageDialogs();
  if (props.multiDialogs?.pushDialog) {
    pushDialog = props.multiDialogs.pushDialog;
  }

  return {
    openBrowse: useCallback(
      (onSelect: (value: T[]) => void, defaultSelection?: T[]) => {
        pushDialog(
          <SelectFilter<T>
            defaultSelection={defaultSelection}
            onMultiSelect={onSelect}
            multiSelection={true}
            {...props}
          />
        );
      },
      [pushDialog, props]
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
  const defaultSelection = props.multiSelection ? props.defaultSelection : [props.defaultSelection];
  const viewParams: object = { ...props.viewParams, defaultSelection };
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
        onClose={props.multiDialogs ? () => props.multiDialogs?.popDialog() : undefined}
      />
    );
  } else {
    return (
      <SingleSelectDialog<T>
        {...props}
        onSelect={props.onSelect ? props.onSelect : () => {}}
        toolbarFilters={toolbarFilters ? toolbarFilters : []}
        tableColumns={tableColumns}
        view={view}
        onClose={props.multiDialogs ? () => props.multiDialogs?.popDialog() : undefined}
      />
    );
  }
}
