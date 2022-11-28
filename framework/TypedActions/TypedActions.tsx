import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Split,
  Tooltip,
} from '@patternfly/react-core'
import { CircleIcon } from '@patternfly/react-icons'
import { ComponentClass, FunctionComponent, useCallback, useMemo, useState } from 'react'
import { useBreakpoint, WindowSize } from '../components/useBreakPoint'
import { TypedActionsButtons } from './TypedActionsButtons'

export enum TypedActionType {
  seperator = 'seperator',
  button = 'button',
  single = 'single',
  bulk = 'bulk',
  dropdown = 'dropdown',
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
  isDisabled?: (item: T) => string
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
  | ITypedSingleAction<T>
  | ITypedDropdownAction<T>

export function TypedActionsDropdown<T extends object>(props: {
  actions: ITypedAction<T>[]
  label?: string
  isPrimary?: boolean
  selectedItems?: T[]
  selectedItem?: T
  position?: DropdownPosition
}) {
  const { actions, label, isPrimary = false, selectedItems, selectedItem } = props
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
            isPrimary && !label
              ? {
                  color: 'var(--pf-global--Color--light-100)',
                }
              : {}
          }
        >
          {label}
        </Toggle>
      }
      isOpen={dropdownOpen}
      isPlain={!label}
      dropdownItems={actions.map((action, index) => (
        <DropdownActionItem
          key={'label' in action ? action.label : `action-${index}`}
          action={action}
          selectedItems={selectedItems ?? []}
          selectedItem={selectedItem}
          hasIcons={hasIcons}
          index={index}
        />
      ))}
      position={props.position}
      style={{ zIndex: 201 }}
    />
  )
}

export function DropdownActionItem<T extends object>(props: {
  action: ITypedAction<T>
  selectedItems: T[]
  selectedItem?: T
  hasIcons: boolean
  index: number
}) {
  const { action, selectedItems, selectedItem, hasIcons, index } = props

  switch (action.type) {
    case TypedActionType.single: {
      let Icon: ComponentClass | FunctionComponent | undefined = action.icon
      if (!Icon && hasIcons) Icon = TransparentIcon
      let tooltip = action.tooltip
      const isDisabled =
        action.isDisabled !== undefined && selectedItem ? action.isDisabled(selectedItem) : false
      tooltip = isDisabled ? isDisabled : tooltip
      return (
        <Tooltip key={action.label} content={tooltip} trigger={tooltip ? undefined : 'manual'}>
          <DropdownItem
            onClick={() => selectedItem && action.onClick(selectedItem)}
            isAriaDisabled={Boolean(isDisabled)}
            icon={
              Icon ? (
                <span style={{ paddingRight: 4 }}>
                  <Icon />
                </span>
              ) : undefined
            }
            style={{
              color:
                action.isDanger && !isDisabled ? 'var(--pf-global--danger-color--100)' : undefined,
            }}
          >
            {action.label}
          </DropdownItem>
        </Tooltip>
      )
    }

    case TypedActionType.button:
    case TypedActionType.bulk: {
      let Icon: ComponentClass | FunctionComponent | undefined = action.icon
      if (!Icon && hasIcons) Icon = TransparentIcon
      let tooltip = action.tooltip
      let isDisabled = false
      if (action.type === TypedActionType.bulk && !selectedItems.length) {
        tooltip = 'No selections'
        isDisabled = true
      }
      return (
        <Tooltip key={action.label} content={tooltip} trigger={tooltip ? undefined : 'manual'}>
          <DropdownItem
            onClick={() => action.onClick(selectedItems)}
            isAriaDisabled={isDisabled}
            icon={
              Icon ? (
                <span style={{ paddingRight: 4 }}>
                  <Icon />
                </span>
              ) : undefined
            }
            style={{
              color:
                action.isDanger && !isDisabled ? 'var(--pf-global--danger-color--100)' : undefined,
            }}
          >
            {action.label}
          </DropdownItem>
        </Tooltip>
      )
    }
    case TypedActionType.dropdown:
      return (
        <TypedActionsDropdown<T> key={action.label} label={action.label} actions={action.options} />
      )
    case TypedActionType.seperator:
      return <DropdownSeparator key={`separator-${index}`} />
    default:
      return <></>
  }
}

export function TypedActions<T extends object>(props: {
  actions: ITypedAction<T>[]
  selectedItems?: T[]
  selectedItem?: T
  wrapper?: ComponentClass | FunctionComponent
  collapse?: WindowSize | 'always'
  noPrimary?: boolean
  position?: DropdownPosition
  iconOnly?: boolean
}) {
  const { actions } = props
  const bp = useBreakpoint(props.collapse !== 'always' ? props.collapse ?? 'lg' : 'lg')
  const collapseButtons = props.collapse === 'always' || !bp

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
    <Split hasGutter={!props.iconOnly}>
      <TypedActionsButtons {...props} actions={buttonActions} />
      <TypedActionsDropdown
        {...props}
        actions={dropdownActions}
        position={props.position}
        isPrimary={!!props.selectedItems?.length}
      />
    </Split>
  )
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />
