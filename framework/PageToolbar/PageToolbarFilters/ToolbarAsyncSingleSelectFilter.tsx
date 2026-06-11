import { ReactNode } from 'react';
import {
  PageAsyncQueryErrorText,
  PageAsyncSelectOptionsFn,
} from '../../PageInputs/PageAsyncSelectOptions';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

/** A function to open a single selection browse modal for a toolbar filter. */
type ToolbarOpenSingleSelectBrowse = (
  onSelect: (value: string) => void,
  defaultSelection?: string
) => void;

export interface IToolbarAsyncSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.AsyncSingleSelect;

  /** The function to query for options. */
  queryOptions: PageAsyncSelectOptionsFn<string>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: PageAsyncQueryErrorText;

  /** The function to open the browse modal. */
  openBrowse?: ToolbarOpenSingleSelectBrowse;

  /** The function to query for the label of a value. */
  queryLabel: (value: string) => ReactNode;

  /**
   * Whether the select required an option to be selected.
   *
   * If true, the select will autoselect the first option,
   * else the select will contain a clear button.
   */
  isRequired?: boolean;

  disableSortOptions?: boolean;
}

/**
 * Helper function to adapt an object based select dialog to a string based select dialog for use in the toolbar.
 *
 * Toolbars use string based filters, but many select dialog uses objects.
 * The toolbar filter uses strings because the values are synced to the URL query string.
 *
 * @param selectFn Function to open the original select dialog that uses objects.
 * @param keyFn Function to get a unique key from the object. Used as the string value in the toolbar filter values and query string.
 * @param objectFn Function to create an object from the key. Used for default selection in the dialog.
 * @returns A function to open the select dialog.
 */
export function singleSelectBrowseAdapter<T>(
  /** The function to open the original select dialog that uses objects. */
  selectFn: (onItemSelect: (itemValue: T) => void, itemDefaultSelection?: T) => void,
  /** The function to get a unique key from the object. Used as the string value in the toolbar filter values and query string. */
  keyFn: (item: T) => string,
  /** The function to create an object from the key. Used for default selection in the dialog. */
  objectFn: (name: string) => object,
  customOnSelect?: (item: T) => void
): ToolbarOpenSingleSelectBrowse {
  return (onSelect: (value: string) => void, defaultSelection?: string) => {
    selectFn(
      (item: T) => {
        customOnSelect ? customOnSelect(item) : onSelect(keyFn(item));
      },
      defaultSelection ? (objectFn(defaultSelection) as T) : undefined
    );
  };
}
