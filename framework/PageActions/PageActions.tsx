import { ButtonVariant, DropdownPosition, Split, SplitItem } from '@patternfly/react-core';
import { ComponentClass, FunctionComponent, useMemo } from 'react';
import { useBreakpoint, WindowSize } from '../components/useBreakPoint';
import { IPageAction } from './PageAction';
import { PageActionType } from './PageActionType';
import { PageDropdownAction } from './PageDropdownAction';
import { PagePinnedActions } from './PagePinnedActions';

/**
 * Page actions represent actions used in table rows, toolbars, and page headers.
 * The PageActions component controls the collapsing of the actions at given breakpoints.
 */
export function PageActions<T extends object>(props: {
  /** An array of PageActions */
  actions: IPageAction<T>[];

  /** The currently selected item for single actions */
  selectedItem?: T;

  /** The currently selected items for bulk actions */
  selectedItems?: T[];

  /** The wrapper for each item
   * @example Wrapping each button in a ToolbarItem
   */
  wrapper?: ComponentClass | FunctionComponent;

  /** When to collapse the primary and secondary items into the dropdown menu */
  collapse?: WindowSize | 'always' | 'never';

  /** The position for the dropdown */
  position?: DropdownPosition;

  /** Indicates if only to show the icon when not collapsed */
  iconOnly?: boolean;

  onOpen?: (open: boolean) => void;
}) {
  const { actions, selectedItem, selectedItems, iconOnly } = props;

  const collapseBreakpoint = useBreakpoint(
    props.collapse !== 'never' && props.collapse !== 'always' ? props.collapse ?? 'lg' : 'lg'
  );
  const collapseButtons =
    props.collapse !== 'never' && (props.collapse === 'always' || !collapseBreakpoint);

  /** Actions that are visible */
  const visibleActions = useMemo(
    () => actions.filter((action) => !isHiddenAction(action, selectedItem)),
    [actions, selectedItem]
  );

  /** Actions that show up outside the dropdown */
  const pinnedActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return [];
    return visibleActions?.filter(isPinnedAction);
  }, [collapseButtons, visibleActions]);

  /** Actions that are not pinned and show up inside the dropdown */
  const dropdownActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return visibleActions;
    return visibleActions?.filter((action) => !isPinnedAction(action)) ?? [];
  }, [collapseButtons, visibleActions]);

  return (
    <Split
      hasGutter={
        (!iconOnly && selectedItem !== undefined) || (selectedItems && selectedItems.length > 0)
      }
    >
      {pinnedActions !== undefined && pinnedActions.length > 0 && (
        <PagePinnedActions {...props} actions={pinnedActions} />
      )}
      {dropdownActions.length > 0 && (
        <SplitItem isFilled style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PageDropdownAction {...props} actions={dropdownActions} onOpen={props.onOpen} />
        </SplitItem>
      )}
    </Split>
  );
}

function isPinnedAction<T extends object>(action: IPageAction<T>) {
  const actionVariants: Array<ButtonVariant | undefined> = [
    ButtonVariant.primary,
    ButtonVariant.secondary,
    ButtonVariant.danger,
  ];
  return action.type !== PageActionType.seperator && actionVariants.includes(action.variant);
}

export function isHiddenAction<T extends object>(
  action: IPageAction<T>,
  selectedItem: T | undefined
): boolean {
  switch (action.type) {
    case PageActionType.single:
    case PageActionType.dropdown:
      return action.isHidden !== undefined && selectedItem ? action.isHidden(selectedItem) : false;
    case PageActionType.bulk:
    case PageActionType.seperator:
    case PageActionType.button:
      return false;
  }
}
