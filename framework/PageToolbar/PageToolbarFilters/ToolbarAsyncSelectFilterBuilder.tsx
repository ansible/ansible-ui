import { useCallback } from 'react';
import { ITableColumn, IToolbarFilter, usePageDialog, ISelected } from '../../../framework';
import { MultiSelectDialog } from '../../../framework/PageDialogs/MultiSelectDialog';
import { SingleSelectDialog } from '../../PageDialogs/SingleSelectDialog';
import { IView, ViewExtendedOptions } from '../../useView';
import { MultiDialogs } from '../../../frontend/hub/administration/repositories/hooks/useAddCollections';

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
  let [, setDialog] = usePageDialog();
  if (props.multiDialogs?.pushDialog) {
    setDialog = props.multiDialogs.pushDialog;
  }

  return {
    openBrowse: useCallback(
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
      [setDialog, props]
    ),
  };
}

export function useAsyncMultiSelectFilterBuilder<T extends object>(
  props: AsyncSelectFilterBuilderProps<T>
) {
  let [, setDialog] = usePageDialog();
  if (props.multiDialogs?.pushDialog) {
    setDialog = props.multiDialogs.pushDialog;
  }

  return {
    openBrowse: useCallback(
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
      [setDialog, props]
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
