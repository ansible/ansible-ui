import { PageMultiSelect } from '../../PageInputs/PageMultiSelect';
import { IPageSelectOption } from '../../PageInputs/PageSelectOption';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarMultiSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.MultiSelect;
  options: IPageSelectOption<string>[];
}

export function ToolbarMultiSelectFilter(props: {
  id?: string;
  placeholder: string;
  filterValues: string[] | undefined;
  setFilterValues: (setter: (prevValues: string[] | undefined) => string[] | undefined) => void;
  options: IPageSelectOption<string>[];
}) {
  return (
    <PageMultiSelect<string>
      placeholder={props.placeholder}
      values={props.filterValues}
      onSelect={props.setFilterValues}
      options={props.options}
      variant="count"
      disableClearSelection
    />
  );
}
