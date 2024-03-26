import { useFormContext } from 'react-hook-form';
import { ISelected, ITableColumn, IToolbarFilter, IView } from '../../../../../framework';
import { useEffect } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';

interface SelectRolesStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
}

export function SelectRolesStep<T extends object>(props: SelectRolesStepProps<T>) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('roles', props.view.selectedItems);
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
