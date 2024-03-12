import { PageSelectOption } from '../../PageInputs/PageSelectOption';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.SingleSelect;
  options: PageSelectOption<string>[];
  isRequired?: boolean;
  placeholder: string;
  disableSortOptions?: boolean;
}
