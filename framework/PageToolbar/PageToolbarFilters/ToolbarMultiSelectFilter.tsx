import { PageSelectOption } from '../../PageInputs/PageSelectOption';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarMultiSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.MultiSelect;
  options: PageSelectOption<string>[];
  placeholder: string;
  disableSortOptions?: boolean;
}
