import { ToolbarFilterType } from '../PageToolbarFilter';
import {
  PageAsyncQueryErrorTextType,
  PageAsyncSingleSelectOptionsFn,
} from './../../PageInputs/PageAsyncSingleSelect';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

type openBrowseType = (onSelect: (value: string) => void, defaultSelection?: string) => void;

export interface IToolbarAsyncSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.AsyncSingleSelect;

  /** The function to query for options. */
  queryOptions: PageAsyncSingleSelectOptionsFn<string>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: PageAsyncQueryErrorTextType;

  // useHook for modal here
  openBrowse?: openBrowseType;

  /**
   * Whether the select required an option to be selected.
   *
   * If true, the select will autoselect the first option,
   * else the select will contain a clear button.
   */
  isRequired?: boolean;
}

// returns function that works with strings and internaly, it does call the original typed function
export function selectedToString<T>(
  // original useSelect function with generic type T
  fn: (onItemSelect: (itemValue: T) => void, itemDefaultSelection?: T) => void,
  // transform T to string function
  getNameFn: (item: T) => string,
  // transform string to object function
  setNameFn: (name: string) => object
): openBrowseType {
  return (onStringSelect: (stringValue: string) => void, stringDefaultSelection?: string) => {
    fn(
      (item: T) => {
        onStringSelect(getNameFn(item));
      },
      setNameFn(stringDefaultSelection || '') as T
    );
  };
}
