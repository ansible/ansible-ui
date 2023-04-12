import { DropdownPosition, Flex, FlexItem } from '@patternfly/react-core';
import {
  ComponentClass,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { WindowSize, useBreakpoint } from '../components/useBreakPoint';
import { IPageAction } from './PageAction';
import { PageActionDropdown } from './PageActionDropdown';
import { isPageActionHidden } from './PageActionUtils';
import { PageActionsPinned } from './PageActionsPinned';

interface PageActionProps<T extends object> {
  /** The array of PageActions */
  actions: IPageAction<T>[];

  /** The currently selected item for single selection actions */
  selectedItem?: T;

  /** The currently selected items for multiple selection actions */
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

  /** Called when a dropdown is opened, allowing the parent to handle the z-index needed */
  onOpen?: (open: boolean) => void;
}

/**
 * Page actions represent actions used in table rows, toolbars, and page headers.
 * The PageActions component controls the collapsing of the actions at given breakpoints.
 */
export function PageActions<T extends object>(props: PageActionProps<T>) {
  const { actions, selectedItem, iconOnly, onOpen } = props;

  const collapseBreakpoint = useBreakpoint(
    props.collapse !== 'never' && props.collapse !== 'always' ? props.collapse ?? 'lg' : 'lg'
  );
  const collapseButtons =
    props.collapse !== 'never' && (props.collapse === 'always' || !collapseBreakpoint);

  /** Actions that are visible */
  const visibleActions = useMemo(
    () => actions.filter((action) => !isPageActionHidden(action, selectedItem)),
    [actions, selectedItem]
  );

  /** Actions that show up outside the dropdown */
  const pinnedActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return [];
    return visibleActions?.filter(isPageActionPinned);
  }, [collapseButtons, visibleActions]);

  /** Actions that are not pinned and show up inside the dropdown */
  const dropdownActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return visibleActions;
    return visibleActions?.filter((action) => !isPageActionPinned(action)) ?? [];
  }, [collapseButtons, visibleActions]);

  // Here we track if any dropdowns are open and if any are, then call onOpen
  // onOpen is needed at a higher level to set zIndex of the open dropdown
  const [openLabels, setOpenLabels] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (Object.values(openLabels).find((v) => v)) onOpen?.(true);
    else onOpen?.(false);
  }, [onOpen, openLabels]);
  const handleOnOpen = useCallback((label: string, open: boolean) => {
    setOpenLabels((labels) => {
      if (labels[label] !== open) {
        labels = { ...labels };
        labels[label] = open;
      }
      return labels;
    });
  }, []);

  return (
    <Flex
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: iconOnly ? 'spaceItemsNone' : 'spaceItemsMd' }}
      justifyContent={{ default: 'justifyContentFlexEnd' }}
    >
      {pinnedActions !== undefined && pinnedActions.length > 0 && (
        <FlexItem>
          <PageActionsPinned {...props} actions={pinnedActions} onOpen={handleOnOpen} />
        </FlexItem>
      )}
      {dropdownActions.length > 0 && (
        <FlexItem>
          <PageActionDropdown {...props} actions={dropdownActions} onOpen={handleOnOpen} />
        </FlexItem>
      )}
    </Flex>
  );
}

function isPageActionPinned<T extends object>(action: IPageAction<T>) {
  return 'isPinned' in action && action.isPinned;
}
