import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { IView, ISelected, ITableColumn, IToolbarFilter } from '../../../../../framework';

interface SelectUsersStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
}

export function SelectUsersStep<T extends object>(props: SelectUsersStepProps<T>) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('users', props.view.selectedItems);
  }, [setValue, props.view.selectedItems]);

  return (
    <>
      <PageMultiSelectList
        view={props.view}
        tableColumns={props.tableColumns}
        toolbarFilters={props.toolbarFilters}
      />
    </>
  );
}
