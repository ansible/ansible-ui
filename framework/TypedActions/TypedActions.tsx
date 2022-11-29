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
  plainText = 'plainText',
}

export interface ITypedActionSeperator {
  type: TypedActionType.seperator
}

export interface ITypedActionPlainText {
  type: TypedActionType.plainText
  label: string
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
  isHidden?: (item: T) => boolean
  dropdownActions?: (item: T) => ITypedDropdownAction<T> | undefined
}

export type ITypedDropdownAction<T extends object> = ITypedActionCommon & {
  type: TypedActionType.dropdown
  variant?: ButtonVariant
  options: ITypedAction<T>[]
  isSubmenu?: boolean
}

export type ITypedAction<T extends object> =
  | ITypedActionSeperator
  | ITypedActionPlainText
  | ITypedActionButton
  | ITypedBulkAction<T>
  | ITypedSingleAction<T>
  | ITypedDropdownAction<T>

export function TypedActionsDropdown<T extends object>(props: {
  actions: ITypedAction<T>[]
  label?: string
  icon?: ComponentClass | FunctionComponent
  isHidden?: boolean
  isDisabled?: boolean
  isPrimary?: boolean
  isSubmenu?: boolean
  selectedItems?: T[]
  selectedItem?: T
  position?: DropdownPosition
}) {
  const {
    actions,
    label,
    icon,
    isHidden,
    isDisabled,
    isPrimary = false,
    isSubmenu,
    selectedItems,
    selectedItem,
  } = props
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hasItemActions = useMemo(
    () => !actions.every((action) => action.type !== TypedActionType.bulk),
    [actions]
  )
  const hasIcons = useMemo(
    () =>
      actions.find(
        (action) =>
          action.type !== TypedActionType.seperator &&
          action.type !== TypedActionType.plainText &&
          action.icon !== undefined
      ) !== undefined,
    [actions]
  )
  if (actions.length === 0) return <></>
  const Icon = icon
  const Toggle = label || Icon ? DropdownToggle : KebabToggle

  return (
    <Dropdown
      onSelect={() => setDropdownOpen(false)}
      toggle={
        <Toggle
          id="toggle-kebab"
          isDisabled={isDisabled}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          toggleVariant={hasItemActions && selectedItems?.length ? 'primary' : undefined}
          isPrimary={isPrimary}
          toggleIndicator={Icon ? null : undefined}
          style={
            isPrimary && !label
              ? {
                  color: 'var(--pf-global--Color--light-100)',
                }
              : {}
          }
        >
          {Icon ? <Icon /> : label}
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
      style={{
        zIndex: 201,
        visibility: isHidden ? 'hidden' : 'visible',
        padding: isSubmenu ? 'var(--pf-global--spacer--sm)' : undefined,
      }}
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
      const isHidden =
        action.isHidden !== undefined && selectedItem ? action.isHidden(selectedItem) : false
      if (isHidden) {
        return null
      }
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
        <TypedActionsDropdown<T>
          key={action.label}
          label={action.label}
          actions={action.options}
          selectedItem={selectedItem}
          isSubmenu={action.isSubmenu}
        />
      )
    case TypedActionType.plainText:
      return <DropdownItem isPlainText>{action.label}</DropdownItem>
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
    return (
      action.type !== TypedActionType.seperator &&
      action.type !== TypedActionType.plainText &&
      actionVariants.includes(action.variant)
    )
  }, [])

  const buttonActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      return []
    }
    return actions?.filter(isButtonAction) ?? []
  }, [collapseButtons, actions, isButtonAction])

  const dropdownActions: ITypedAction<T>[] = useMemo(() => {
    if (collapseButtons) {
      const dropdownActions = [...actions]
      /** If there is a button action (type ITypedSingleAction<T>) that contains a submenu of type ITypedDropdownAction<T>,
       * add the underlying dropdown action directly to the kebab menu when the button is collapsed
       */
      dropdownActions?.forEach((action, index) => {
        if (
          action.type === TypedActionType.single &&
          action.dropdownActions !== undefined &&
          props.selectedItem
        ) {
          const subMenuActions = action.dropdownActions(props.selectedItem)
          if (subMenuActions && subMenuActions.type === TypedActionType.dropdown) {
            subMenuActions.isSubmenu = true
            dropdownActions[index] = subMenuActions
          }
        } else if (action.type === TypedActionType.dropdown) {
          action.isSubmenu = true
        }
      })

      return dropdownActions ?? []
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
  }, [collapseButtons, actions, props.selectedItem, isButtonAction])

  return (
    <Split hasGutter={!props.iconOnly}>
      <TypedActionsButtons {...props} actions={buttonActions} />
      <TypedActionsDropdown
        {...props}
        actions={dropdownActions}
        selectedItem={props.selectedItem}
        position={props.position}
        isPrimary={!!props.selectedItems?.length}
      />
    </Split>
  )
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />
