import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';
import {
  pageAsyncSingleSelectOptionsFunction,
  pageQueryErrorTextType,
} from './../../PageInputs/PageAsyncSingleSelect';

export interface IToolbarAsyncSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.AsyncSingleSelect;
  isRequired?: boolean;

  /** The function to query for options. */
  queryOptions: pageAsyncSingleSelectOptionsFunction<string>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: pageQueryErrorTextType;

  // useHook for modal here
  openBrowse?: (onSelect: (value: string) => void, defaultSelection?: string) => void;
}
