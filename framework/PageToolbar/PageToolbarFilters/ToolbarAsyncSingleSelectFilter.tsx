import { ToolbarFilterType } from '../PageToolbarFilter';
import {
  PageAsyncQueryErrorTextType,
  PageAsyncSingleSelectOptionsFn,
} from './../../PageInputs/PageAsyncSingleSelect';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarAsyncSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.AsyncSingleSelect;

  /** The function to query for options. */
  queryOptions: PageAsyncSingleSelectOptionsFn<string>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: PageAsyncQueryErrorTextType;

  // useHook for modal here
  openBrowse?: (onSelect: (value: string) => void, defaultSelection?: string) => void;

  /**
   * Whether the select required an option to be selected.
   *
   * If true, the select will autoselect the first option,
   * else the select will contain a clear button.
   */
  isRequired?: boolean;
}
