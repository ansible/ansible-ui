import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Tooltip,
} from '@patternfly/react-core'
import { CircleIcon } from '@patternfly/react-icons'
import { ComponentClass, Fragment, FunctionComponent, useMemo, useState, useCallback } from 'react'
import { useBreakpoint, WindowSize } from './components/useBreakPoint'

export interface IItemActionClick<T> {
  icon?: ComponentClass
  label: string
  onClick: (item: T) => void
}

export function isItemActionClick<T>(
  itemAction: IItemAction<T>
): itemAction is IItemActionClick<T> {
  return 'onClick' in itemAction
}

export interface IItemActionSeperator {
  isSeparator: true
}

export function isItemActionSeperator<T>(
  itemAction: IItemAction<T>
): itemAction is IItemActionSeperator {
  return 'isSeparator' in itemAction
}

export enum TypedActionType {
  seperator = 'seperator',
  button = 'button',
  bulk = 'bulk',
  dropdown = 'dropdown',
}

export type IItemAction<T> = IItemActionClick<T> | IItemActionSeperator

export interface ITypedActionSeperator {
  type: TypedActionType.seperator
}

interface ITypedActionCommon {
  icon?: ComponentClass
  label: string
  shortLabel?: string
  tooltip?: string
  isDanger?: boolean
}

export type ITypedActionButton = ITypedActionCommon & {
  type: TypedActionType.button
  variant?: ButtonVariant
  onClick: () => void
}

export type ITypedBulkAction<T extends object> = ITypedActionCommon & {
  type: TypedActionType.bulk
  variant?: ButtonVariant
  onClick: (selectedItems: T[]) => void
}

export type ITypedDropdownAction<T extends object> = ITypedActionCommon & {
  type: TypedActionType.dropdown
  variant?: ButtonVariant
  options: ITypedAction<T>[]
}

export type ITypedAction<T extends object> =
  | ITypedActionSeperator
  | ITypedActionButton
  | ITypedBulkAction<T>
  | ITypedDropdownAction<T>

export function TypedActionsDropdown<T extends object>(props: {
  actions: ITypedAction<T>[]
  label?: string
  isPrimary?: boolean
  selectedItems?: T[]
  position?: DropdownPosition
}) {
  const { actions, label, isPrimary = false, selectedItems } = props
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hasItemActions = useMemo(
    () => !actions.every((action) => action.type !== TypedActionType.bulk),
    [actions]
  )
  const hasIcons = useMemo(
    () =>
      actions.find(
        (action) => action.type !== TypedActionType.seperator && action.icon !== undefined
      ) !== undefined,
    [actions]
  )
  if (actions.length === 0) return <></>
  const Toggle = label ? DropdownToggle : KebabToggle

  return (
    <Dropdown
      onSelect={() => setDropdownOpen(false)}
      toggle={
        <Toggle
          id="toggle-kebab"
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          toggleVariant={hasItemActions && selectedItems?.length ? 'primary' : undefined}
          isPrimary={isPrimary}
          style={
            !isPrimary
              ? {
                  color:
                    hasItemActions && selectedItems?.length
                      ? 'var(--pf-global--Color--light-100)'
                      : undefined,
                  backgroundColor:
                    hasItemActions && selectedItems?.length
                      ? 'var(--pf-global--primary-color--100)'
                      : undefined,
                }
              : {}
          }
        >
          {label}
        </Toggle>
      }
      isOpen={dropdownOpen}
      isPlain={!label}
      dropdownItems={actions.map((action, index) => {
        switch (action.type) {
          case TypedActionType.button:
          case TypedActionType.bulk: {
            let Icon: ComponentClass | FunctionComponent | undefined = action.icon
            if (!Icon && hasIcons) Icon = TransparentIcon
            let tooltip = action.tooltip
            let isDisabled = false
            if (action.type === TypedActionType.bulk && (!selectedItems || !selectedItems.length)) {
              tooltip = 'No selections'
              isDisabled = true
            }
            return (
              <Tooltip
                key={action.label}
                content={tooltip}
                trigger={tooltip ? undefined : 'manual'}
              >
                <DropdownItem
                  onClick={() => action.onClick(selectedItems ?? [])}
                  isAriaDisabled={isDisabled}
                  icon={
                    Icon ? (
                      <span style={{ paddingRight: 4 }}>
                        <Icon />
                      </span>
                    ) : undefined
                  }
                  // style={{ color: 'var(--pf-global--primary-color--100)' }}
                  style={{
                    color:
                      action.isDanger && !isDisabled
                        ? 'var(--pf-global--danger-color--100)'
                        : undefined,
                  }}
                >
                  {action.label}
                </DropdownItem>
              </Tooltip>
            )
          }
          case TypedActionType.dropdown:
            return (
              <TypedActionsDropdown<T>
                key={action.label}
                label={action.label}
                actions={action.options}
              />
            )
          case TypedActionType.seperator:
            return <DropdownSeparator key={`separator-${index}`} />
        }
      })}
      position={props.position}
      style={{ zIndex: 201 }}
    />
  )
}

export function TypedActionsButtons<T extends object>(props: {
  actions: ITypedAction<T>[]
  selectedItems?: T[]
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
}) {
  const { actions, selectedItems, wrapper } = props
  if (actions.length === 0) return <></>
  return (
    <>
      {actions.map((action, index) => (
        <TypedActionButton
          key={index}
          action={action}
          selectedItems={selectedItems}
          wrapper={wrapper}
        />
      ))}
    </>
  )
}

export function TypedActionButton<T extends object>(props: {
  action: ITypedAction<T>
  selectedItems?: T[]
  wrapper?: ComponentClass | FunctionComponent
  noPrimary?: boolean
}) {
  const { action, selectedItems, wrapper, noPrimary } = props
  const Wrapper = wrapper ?? Fragment
  switch (action.type) {
    case TypedActionType.seperator: {
      return <></>
    }
    case TypedActionType.bulk: {
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
    case TypedActionType.button: {
      const Icon = action.icon
      const tooltip = action.tooltip
      const isDisabled = false
      let variant = action.variant ?? ButtonVariant.secondary
      if (selectedItems && selectedItems.length) {
        switch (variant) {
          case ButtonVariant.danger:
          case ButtonVariant.primary:
            variant = ButtonVariant.secondary
            break
        }
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
    case TypedActionType.dropdown: {
      return (
        <TypedActionsDropdown<T>
          actions={action.options}
          label={action.label}
          isPrimary={action.variant === ButtonVariant.primary}
        />
      )
    }
  }
}

export function TypedActions<T extends object>(props: {
  actions: ITypedAction<T>[]
  selectedItems?: T[]
  wrapper?: ComponentClass | FunctionComponent
  collapse?: WindowSize
  noPrimary?: boolean
  position?: DropdownPosition
}) {
  const { actions } = props
  const collapseButtons = !useBreakpoint(props.collapse ?? 'lg')

  const isButtonAction = useCallback((action: ITypedAction<T>) => {
    const actionVariants: Array<ButtonVariant | undefined> = [
      ButtonVariant.primary,
      ButtonVariant.secondary,
      ButtonVariant.danger,
    ]
    return action.type !== TypedActionType.seperator && actionVariants.includes(action.variant)
  }, [])

  const buttonActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return []
    }
    return actions?.filter(isButtonAction) ?? []
  }, [collapseButtons, actions, isButtonAction])

  const dropdownActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return actions ?? []
    }
    const dropdownActions = actions?.filter((action) => !isButtonAction(action)) ?? []
    while (dropdownActions.length && dropdownActions[0].type === TypedActionType.seperator)
      dropdownActions.shift()
    while (
      dropdownActions.length &&
      dropdownActions[dropdownActions.length - 1].type === TypedActionType.seperator
    )
      dropdownActions.pop()
    return dropdownActions
  }, [collapseButtons, actions, isButtonAction])

  return (
    <>
      <TypedActionsButtons {...props} actions={buttonActions} />
      <TypedActionsDropdown {...props} actions={dropdownActions} position={props.position} />
    </>
  )
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />
