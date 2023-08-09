import { PageSelectOption } from '../../PageInputs/PageSelectOption';
import { PageSingleSelect } from '../../PageInputs/PageSingleSelect';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.SingleSelect;
  options: PageSelectOption<string>[];
  isRequired?: boolean;
}

export function ToolbarSingleSelectFilter(props: {
  id?: string;
  placeholder: string;
  filterValues: string[] | undefined;
  setFilterValues: (setter: (prevValues: string[] | undefined) => string[] | undefined) => void;
  options: PageSelectOption<string>[];
  isRequired?: boolean;
}) {
  const value = props.filterValues?.length === 1 ? props.filterValues[0] : '';
  const onSelect = (value: string) => props.setFilterValues(() => [value]);
  return (
    <PageSingleSelect
      placeholder={props.placeholder}
      value={value}
      onSelect={onSelect}
      options={props.options}
      isRequired={props.isRequired}
    />
  );
}
