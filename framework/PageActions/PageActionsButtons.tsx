import { ButtonVariant, DropdownPosition, Split } from '@patternfly/react-core'
import { ComponentClass, FunctionComponent } from 'react'
import { IPageAction } from './PageAction'
import { PageActionBulk } from './PageActionBulk'
import { PageActionButton } from './PageActionButton'
import { PageActionsDropdown } from './PageActionsDropdown'
import { PageActionSingle } from './PageActionSingle'
import { PageActionType } from './PageActionType'

export function PageActionsButtons<T extends object>(props: {
  actions: IPageAction<T>[]
  selectedItems?: T[]
  selectedItem?: T
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
  iconOnly?: boolean
}) {
  const { actions, selectedItems, selectedItem, wrapper, iconOnly } = props
  if (actions.length === 0) return <></>
  return (
    <Split hasGutter>
      {actions.map((action, index) => (
        <PageActionButton2
          key={index}
          action={action}
          selectedItems={selectedItems}
          selectedItem={selectedItem}
          wrapper={wrapper}
          iconOnly={iconOnly}
        />
      ))}
    </Split>
  )
}

export function PageActionButton2<T extends object>(props: {
  action: IPageAction<T>
  selectedItems?: T[]
  selectedItem?: T
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
  iconOnly?: boolean
}) {
  const { action, selectedItems, selectedItem, wrapper, noPrimary } = props

  switch (action.type) {
    case PageActionType.seperator: {
      return <></>
    }
    case PageActionType.single: {
      return (
        <PageActionSingle
          action={action}
          selectedItem={selectedItem}
          noPrimary={noPrimary}
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      )
    }
    case PageActionType.bulk: {
      return (
        <PageActionBulk
          action={action}
          selectedItems={selectedItems}
          noPrimary={noPrimary}
          wrapper={wrapper}
        />
      )
    }
    case PageActionType.button: {
      return (
        <PageActionButton
          action={action}
          selectedItems={selectedItems}
          noPrimary={noPrimary}
          wrapper={wrapper}
        />
      )
    }
    case PageActionType.dropdown: {
      let tooltip = action.label
      const isDisabled =
        action.isDisabled !== undefined && selectedItem ? action.isDisabled(selectedItem) : ''
      tooltip = isDisabled ? isDisabled : tooltip
      return (
        <PageActionsDropdown<T>
          actions={action.options}
          selectedItems={selectedItems}
          selectedItem={selectedItem}
          label={action.label}
          icon={action.icon}
          iconOnly={props.iconOnly}
          position={DropdownPosition.right}
          isDisabled={Boolean(isDisabled)}
          tooltip={props.iconOnly || isDisabled ? tooltip : undefined}
          isPrimary={action.variant === ButtonVariant.primary && !selectedItems?.length}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
