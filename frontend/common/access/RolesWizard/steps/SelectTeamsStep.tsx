import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { IView, ISelected, ITableColumn, IToolbarFilter } from '../../../../../framework';

interface SelectTeamsStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
}

export function SelectTeamsStep<T extends object>(props: SelectTeamsStepProps<T>) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('teams', props.view.selectedItems);
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
