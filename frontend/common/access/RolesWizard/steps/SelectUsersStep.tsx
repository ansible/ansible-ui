import { SelectColumn } from '@patternfly/react-table';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';

export function SelectUsersStep(props) {
  return (
    <PageMultiSelectList
      view={props.view}
      tableColumns={props.tableColumns}
      emptyStateTitle={'empty'}
      errorStateTitle={'error'}
    />
  );
}
