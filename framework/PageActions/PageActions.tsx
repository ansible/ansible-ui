import { ButtonVariant, DropdownPosition, Split, SplitItem } from '@patternfly/react-core'
import { ComponentClass, FunctionComponent, useMemo } from 'react'
import { useBreakpoint, WindowSize } from '../components/useBreakPoint'
import { IPageAction } from './PageAction'
import { PageActionType } from './PageActionType'
import { PageDropdownAction } from './PageDropdownAction'
import { PagePinnedActions } from './PagePinnedActions'

/**
 * PageActions
 */
export function PageActions<T extends object>(props: {
  /** An array of PageActions */
  actions: IPageAction<T>[]

  /** The currently selected item for single actions */
  selectedItem?: T

  /** The currently selected items for bulk actions */
  selectedItems?: T[]

  /** The wrapper for each item
   * @example Wrapping each button in a ToolbarItem
   */
  wrapper?: ComponentClass | FunctionComponent

  /** When to collapse the primary and secondary items into the dropdown menu */
  collapse?: WindowSize | 'always'

  /** The position for the dropdown */
  position?: DropdownPosition

  /** Indicates if only to show the icon when not collapsed */
  iconOnly?: boolean
}) {
  const { actions, selectedItem, selectedItems, iconOnly } = props

  const collapseBreakpoint = useBreakpoint(
    props.collapse !== 'always' ? props.collapse ?? 'lg' : 'lg'
  )
  const collapseButtons = props.collapse === 'always' || !collapseBreakpoint

  /** Actions that are visible */
  const visibleActions = useMemo(
    () => actions.filter((action) => !isHiddenAction(action, selectedItem)),
    [actions, selectedItem]
  )

  /** Actions that show up outside the dropdown */
  const pinnedActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return []
    return visibleActions?.filter(isPinnedAction)
  }, [collapseButtons, visibleActions])

  /** Actions that are not pinned and show up inside the dropdown */
  const dropdownActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) return visibleActions

    const dropdownActions = visibleActions?.filter((action) => !isPinnedAction(action)) ?? []

    // TODO move this logic to PageDropdown Action as it needs to remove seperators for sub dropdowns

    // Remove seperators at beginning of actions
    while (dropdownActions.length && dropdownActions[0].type === PageActionType.seperator) {
      dropdownActions.shift()
    }

    // Remove seperators at end of actions
    while (
      dropdownActions.length &&
      dropdownActions[dropdownActions.length - 1].type === PageActionType.seperator
    ) {
      dropdownActions.pop()
    }

    // TODO remove two seperators in a row

    return dropdownActions
  }, [collapseButtons, visibleActions])

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
          <PageDropdownAction {...props} actions={dropdownActions} />
        </SplitItem>
      )}
    </Split>
  )
}

function isPinnedAction<T extends object>(action: IPageAction<T>) {
  const actionVariants: Array<ButtonVariant | undefined> = [
    ButtonVariant.primary,
    ButtonVariant.secondary,
    ButtonVariant.danger,
  ]
  return action.type !== PageActionType.seperator && actionVariants.includes(action.variant)
}

function isHiddenAction<T extends object>(
  action: IPageAction<T>,
  selectedItem: T | undefined
): boolean {
  switch (action.type) {
    case PageActionType.single:
    case PageActionType.dropdown:
      return action.isHidden !== undefined && selectedItem ? action.isHidden(selectedItem) : false
    case PageActionType.bulk:
    case PageActionType.seperator:
    case PageActionType.button:
      return false
  }
}
