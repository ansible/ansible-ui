import { SelectColumn } from '@patternfly/react-table';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { IView, ISelected, ITableColumn, IToolbarFilter } from '../../../../../framework';

interface SelectUsersStepProps<T extends object> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
}

export function SelectUsersStep<T extends object>(props: SelectUsersStepProps<T>) {
  return (
    <PageMultiSelectList
      view={props.view}
      tableColumns={props.tableColumns}
      toolbarFilters={props.toolbarFilters}
      onSelect={(vals) => {
        console.log('onSelect', vals);
      }}
    />
  );
}
