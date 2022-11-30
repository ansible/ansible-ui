import { ButtonVariant, DropdownPosition, Split, SplitItem } from '@patternfly/react-core'
import { ComponentClass, FunctionComponent, useCallback, useMemo } from 'react'
import { useBreakpoint, WindowSize } from '../components/useBreakPoint'
import { IPageAction } from './PageAction'
import { PageActionsButtons } from './PageActionsButtons'
import { PageActionsDropdown } from './PageActionsDropdown'
import { PageActionType } from './PageActionType'

export function PageActions<T extends object>(props: {
  actions: IPageAction<T>[]
  selectedItems?: T[]
  selectedItem?: T
  wrapper?: ComponentClass | FunctionComponent
  collapse?: WindowSize | 'always'
  noPrimary?: boolean
  position?: DropdownPosition
  iconOnly?: boolean
  isFilled?: boolean
}) {
  const { actions } = props
  const bp = useBreakpoint(props.collapse !== 'always' ? props.collapse ?? 'lg' : 'lg')
  const collapseButtons = props.collapse === 'always' || !bp

  const isButtonAction = useCallback((action: IPageAction<T>) => {
    const actionVariants: Array<ButtonVariant | undefined> = [
      ButtonVariant.primary,
      ButtonVariant.secondary,
      ButtonVariant.danger,
    ]
    return action.type !== PageActionType.seperator && actionVariants.includes(action.variant)
  }, [])
  const isHidden = useCallback(
    (action: IPageAction<T>) => {
      return (action.type === PageActionType.single || action.type === PageActionType.dropdown) &&
        action.isHidden !== undefined &&
        props.selectedItem
        ? action.isHidden(props.selectedItem)
        : false
    },
    [props.selectedItem]
  )

  const buttonActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return []
    }
    return (
      actions?.filter((action: IPageAction<T>) => isButtonAction(action) && !isHidden(action)) ?? []
    )
  }, [collapseButtons, actions, isButtonAction, isHidden])

  const dropdownActions: IPageAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return actions ?? []
    }
    const dropdownActions =
      actions?.filter((action) => !isButtonAction(action) && !isHidden(action)) ?? []
    while (dropdownActions.length && dropdownActions[0].type === PageActionType.seperator)
      dropdownActions.shift()
    while (
      dropdownActions.length &&
      dropdownActions[dropdownActions.length - 1].type === PageActionType.seperator
    )
      dropdownActions.pop()
    return dropdownActions
  }, [collapseButtons, actions, isButtonAction, isHidden])

  return (
    <Split style={props.isFilled ? { width: '100%' } : undefined} hasGutter={!props.iconOnly}>
      <SplitItem isFilled>
        <PageActionsButtons {...props} actions={buttonActions} />
      </SplitItem>

      <PageActionsDropdown
        {...props}
        actions={dropdownActions}
        selectedItem={props.selectedItem}
        position={props.position}
        isPrimary={!!props.selectedItems?.length}
      />
    </Split>
  )
}
