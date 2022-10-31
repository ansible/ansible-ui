import { ComponentClass, Fragment, FunctionComponent } from 'react'
import { Button, ButtonVariant, Tooltip, Split } from '@patternfly/react-core'
import {
  ITypedAction,
  ITypedActionButton,
  ITypedSingleAction,
  ITypedBulkAction,
  TypedActionType,
  TypedActionsDropdown,
} from './TypedActions'

export function TypedActionsButtons<T extends object>(props: {
  actions: ITypedAction<T>[]
  selectedItems?: T[]
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
}) {
  const { actions, selectedItems, wrapper } = props
  if (actions.length === 0) return <></>
  return (
    <Split hasGutter>
      {actions.map((action, index) => (
        <TypedActionButton
          key={index}
          action={action}
          selectedItems={selectedItems}
          wrapper={wrapper}
        />
      ))}
    </Split>
  )
}
export function TypedActionButton<T extends object>(props: {
  action: ITypedAction<T>
  selectedItems?: T[]
  selectedItem?: T
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
  iconOnly?: boolean
}) {
  const { action, selectedItems, selectedItem, wrapper, noPrimary } = props

  switch (action.type) {
    case TypedActionType.seperator: {
      return <></>
    }
    case TypedActionType.single: {
      return (
        <ActionSingleButton
          action={action}
          selectedItem={selectedItem}
          noPrimary={noPrimary}
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      )
    }
    case TypedActionType.bulk: {
      return (
        <ActionBulkButton
          action={action}
          selectedItems={selectedItems}
          noPrimary={noPrimary}
          wrapper={wrapper}
        />
      )
    }
    case TypedActionType.button: {
      return (
        <ActionButton
          action={action}
          selectedItems={selectedItems}
          noPrimary={noPrimary}
          wrapper={wrapper}
        />
      )
    }
    case TypedActionType.dropdown: {
      return (
        <TypedActionsDropdown<T>
          actions={action.options}
          selectedItems={selectedItems}
          label={action.label}
          isPrimary={action.variant === ButtonVariant.primary && !selectedItems?.length}
        />
      )
    }
  }
}

function ActionButton<T extends object>(props: {
  action: ITypedActionButton
  selectedItems?: T[]
  noPrimary?: boolean
  wrapper?: ComponentClass | FunctionComponent
}) {
  const { action, selectedItems, noPrimary, wrapper } = props
  const Wrapper = wrapper ?? Fragment
  const Icon = action.icon
  const tooltip = action.tooltip
  const isDisabled = false
  let variant = action.variant ?? ButtonVariant.secondary
  if (
    selectedItems &&
    selectedItems.length &&
    [ButtonVariant.primary, ButtonVariant.danger].includes(variant)
  ) {
    variant = ButtonVariant.secondary
  }
  if (variant === ButtonVariant.primary && noPrimary) {
    variant = ButtonVariant.secondary
  }
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger
  }

  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          variant={variant}
          isDanger={action.isDanger}
          icon={
            Icon ? (
              <span style={{ paddingRight: 4 }}>
                <Icon />
              </span>
            ) : undefined
          }
          isAriaDisabled={isDisabled}
          onClick={action.onClick}
        >
          {action.shortLabel ? action.shortLabel : action.label}
        </Button>
      </Tooltip>
    </Wrapper>
  )
}

function ActionBulkButton<T extends object>(props: {
  action: ITypedBulkAction<T>
  selectedItems?: T[]
  noPrimary?: boolean
  wrapper?: ComponentClass | FunctionComponent
}) {
  const { action, noPrimary, selectedItems, wrapper } = props
  const Wrapper = wrapper ?? Fragment
  const Icon = action.icon
  let tooltip = action.tooltip
  let isDisabled = false
  let variant = action.variant ?? ButtonVariant.secondary
  if (variant === ButtonVariant.primary && noPrimary) {
    variant = ButtonVariant.secondary
  }
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger
  }
  if (!selectedItems || !selectedItems.length) {
    tooltip = 'No selections'
    isDisabled = true
  }
  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          variant={variant}
          icon={
            Icon ? (
              <span style={{ paddingRight: 4 }}>
                <Icon />
              </span>
            ) : undefined
          }
          isAriaDisabled={isDisabled}
          onClick={() => action.onClick(selectedItems ?? [])}
          isDanger={action.isDanger}
        >
          {action.shortLabel ? action.shortLabel : action.label}
        </Button>
      </Tooltip>
    </Wrapper>
  )
}

function ActionSingleButton<T extends object>(props: {
  action: ITypedSingleAction<T>
  selectedItem?: T
  noPrimary?: boolean
  iconOnly?: boolean
  wrapper?: ComponentClass | FunctionComponent
}) {
  const { action, selectedItem, noPrimary, wrapper } = props
  const Wrapper = wrapper ?? Fragment
  const Icon = action.icon
  const tooltip = action.tooltip
  const isDisabled = false
  let variant = action.variant ?? ButtonVariant.secondary
  if (variant === ButtonVariant.primary && noPrimary) {
    variant = ButtonVariant.secondary
  }
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger
  }
  if (props.iconOnly) {
    variant = ButtonVariant.plain
  }
  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          variant={variant}
          icon={
            Icon ? (
              <span style={{ marginLeft: -4, paddingRight: 4 }}>
                <Icon />
              </span>
            ) : undefined
          }
          isAriaDisabled={isDisabled}
          onClick={() => selectedItem && action.onClick(selectedItem)}
          isDanger={action.isDanger}
        >
          {props.iconOnly && Icon ? <Icon /> : action.shortLabel ? action.shortLabel : action.label}
        </Button>
      </Tooltip>
    </Wrapper>
  )
}
