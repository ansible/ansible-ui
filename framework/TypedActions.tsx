import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  KebabToggle,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core'
import { CircleIcon } from '@patternfly/react-icons'
import { IAction } from '@patternfly/react-table'
import { ComponentClass, Fragment, FunctionComponent, useMemo, useState } from 'react'
import { useBreakpoint, WindowSize } from './components/useBreakPoint'

export enum TypedActionType {
  seperator = 'seperator',
  button = 'button',
  single = 'single',
  bulk = 'bulk',
}

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

export type ITypedSingleAction<T extends object> = ITypedActionCommon & {
  type: TypedActionType.single
  variant?: ButtonVariant
  onClick: (item: T) => void
}

export type ITypedAction<T extends object> =
  | ITypedActionSeperator
  | ITypedActionButton
  | ITypedBulkAction<T>
  | ITypedSingleAction<T>

export function TypedActionsDropdown<T extends object>(props: {
  actions: ITypedAction<T>[]
  selectedItems?: T[]
  position?: DropdownPosition
}) {
  const { actions, selectedItems } = props
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
  return (
    <Dropdown
      onSelect={() => setDropdownOpen(false)}
      toggle={
        <KebabToggle
          id="toggle-kebab"
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          toggleVariant={hasItemActions && selectedItems?.length ? 'primary' : undefined}
          style={{
            color:
              hasItemActions && selectedItems?.length
                ? 'var(--pf-global--Color--light-100)'
                : undefined,
            backgroundColor:
              hasItemActions && selectedItems?.length
                ? 'var(--pf-global--primary-color--100)'
                : undefined,
          }}
        />
      }
      isOpen={dropdownOpen}
      isPlain
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
}) {
  const { action, selectedItems, selectedItem, wrapper, noPrimary } = props
  const Wrapper = wrapper ?? Fragment
  switch (action.type) {
    case TypedActionType.seperator: {
      return <></>
    }
    case TypedActionType.single: {
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
              {action.shortLabel ? action.shortLabel : action.label}
            </Button>
          </Tooltip>
        </Wrapper>
      )
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

  const buttonActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return []
    } else {
      const buttonActions = actions?.filter(
        (action) =>
          (action.type === TypedActionType.button || action.type === TypedActionType.bulk) &&
          (action.variant === ButtonVariant.primary ||
            action.variant === ButtonVariant.secondary ||
            action.variant === ButtonVariant.danger)
      )
      return buttonActions ?? []
    }
  }, [collapseButtons, actions])

  const dropdownActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return actions ?? []
    } else {
      let dropdownActions = actions?.filter(
        (action) =>
          !(
            (action.type === TypedActionType.button || action.type === TypedActionType.bulk) &&
            (action.variant === ButtonVariant.primary ||
              action.variant === ButtonVariant.secondary ||
              action.variant === ButtonVariant.danger)
          )
      )
      dropdownActions = dropdownActions ?? []
      while (dropdownActions.length && dropdownActions[0].type === TypedActionType.seperator)
        dropdownActions.shift()
      while (
        dropdownActions.length &&
        dropdownActions[dropdownActions.length - 1].type === TypedActionType.seperator
      )
        dropdownActions.pop()
      return dropdownActions
    }
  }, [collapseButtons, actions])

  return (
    <Split hasGutter>
      <TypedActionsButtons {...props} actions={buttonActions} />
      <TypedActionsDropdown {...props} actions={dropdownActions} position={props.position} />
    </Split>
  )
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />

export function useTypedActionsToTableActions<T extends object>(props: {
  actions: ITypedAction<T>[]
  item: T
  wrapper?: ComponentClass | FunctionComponent
  collapse?: WindowSize
  noPrimary?: boolean
  position?: DropdownPosition
}): IAction[] {
  const { actions } = props
  const collapseButtons = !useBreakpoint(props.collapse ?? 'lg')

  const buttonActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return []
    } else {
      const buttonActions = actions?.filter(
        (action) =>
          (action.type === TypedActionType.button ||
            action.type === TypedActionType.bulk ||
            action.type === TypedActionType.single) &&
          (action.variant === ButtonVariant.primary ||
            action.variant === ButtonVariant.secondary ||
            action.variant === ButtonVariant.danger)
      )
      return buttonActions ?? []
    }
  }, [collapseButtons, actions])

  const dropdownActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return actions ?? []
    } else {
      let dropdownActions = actions?.filter(
        (action) =>
          !(
            (action.type === TypedActionType.button ||
              action.type === TypedActionType.bulk ||
              action.type === TypedActionType.single) &&
            (action.variant === ButtonVariant.primary ||
              action.variant === ButtonVariant.secondary ||
              action.variant === ButtonVariant.danger)
          )
      )
      dropdownActions = dropdownActions ?? []
      while (dropdownActions.length && dropdownActions[0].type === TypedActionType.seperator)
        dropdownActions.shift()
      while (
        dropdownActions.length &&
        dropdownActions[dropdownActions.length - 1].type === TypedActionType.seperator
      )
        dropdownActions.pop()
      return dropdownActions
    }
  }, [collapseButtons, actions])

  return [
    ...buttonActions.map((buttonAction) => {
      switch (buttonAction.type) {
        case TypedActionType.button:
          return {
            title: <TypedActionButton action={buttonAction} />,
            isOutsideDropdown: true,
          }
        case TypedActionType.single:
          return {
            title: <TypedActionButton action={buttonAction} selectedItem={props.item} />,
            isOutsideDropdown: true,
          }
        case TypedActionType.bulk:
          return {
            title: (
              <TypedActionButton
                action={buttonAction}
                selectedItems={props.item ? [props.item] : []}
              />
            ),
            isOutsideDropdown: true,
          }
        default:
          return null
      }
    }),
    ...dropdownActions.map((buttonAction) => {
      switch (buttonAction.type) {
        case TypedActionType.button: {
          const Icon = buttonAction.icon
          return {
            title: (
              <Split hasGutter>
                {Icon && (
                  <SplitItem>
                    <Icon />
                  </SplitItem>
                )}
                <SplitItem>{buttonAction.label}</SplitItem>
              </Split>
            ),
            onClick: () => {
              buttonAction.onClick()
            },
          }
        }
        case TypedActionType.single: {
          const Icon = buttonAction.icon
          return {
            title: (
              <Split hasGutter>
                {Icon && (
                  <SplitItem>
                    <Icon />
                  </SplitItem>
                )}
                <SplitItem>{buttonAction.label}</SplitItem>
              </Split>
            ),
            onClick: () => {
              buttonAction.onClick(props.item)
            },
          }
        }
        case TypedActionType.bulk: {
          const Icon = buttonAction.icon
          return {
            title: (
              <Split hasGutter>
                {Icon && (
                  <SplitItem>
                    <Icon />
                  </SplitItem>
                )}
                <SplitItem>{buttonAction.label}</SplitItem>
              </Split>
            ),
            onClick: () => {
              buttonAction.onClick([props.item])
            },
          }
        }
        default:
          return { isSeparator: true }
      }
    }),
  ].filter((i) => i !== null) as IAction[]
}
