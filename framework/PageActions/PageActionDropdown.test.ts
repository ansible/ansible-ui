import { describe, expect, it } from 'vitest';
import { IPageAction, PageActionSelection, PageActionType } from './PageAction';
import { filterActionSeperators } from './PageActionDropdown';

describe('filterActionSeperators', () => {
  it('removes leading, trailing, and adjacent separators', () => {
    const action = {
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      label: 'Action',
      onClick: () => undefined,
    } satisfies IPageAction<object>;
    const separator = { type: PageActionType.Seperator } satisfies IPageAction<object>;

    expect(filterActionSeperators([separator, action, separator, separator, separator])).toEqual([
      action,
    ]);
  });
});
