import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core'
import { CircleIcon } from '@patternfly/react-icons'
import { IAction } from '@patternfly/react-table'
import { ComponentClass, FunctionComponent, useCallback, useMemo, useState } from 'react'
import { IconWrapper } from '../components/IconWrapper'
import { PFColorE, pfDisabled } from '../components/pfcolors'
import { useBreakpoint, WindowSize } from '../components/useBreakPoint'
import { TypedActionButton, TypedActionsButtons } from './TypedActionsButtons'

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
  isPlain?: boolean
  isPrimary?: boolean
  selectedItems?: T[]
  selectedItem?: T
  position?: DropdownPosition
}) {
  const {
    actions,
    label,
    icon,
    isPlain,
    isHidden,
    isDisabled,
    isPrimary = false,
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
      isPlain={!label ?? isPlain}
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
      style={{ zIndex: 201, visibility: isHidden ? 'hidden' : 'visible' }}
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
      const isHidden =
        action.isHidden !== undefined && selectedItem ? action.isHidden(selectedItem) : false
      tooltip = isDisabled ? isDisabled : tooltip
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
        <TypedActionsDropdown<T> key={action.label} label={action.label} actions={action.options} />
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
      /**
       * Handle actions of type 'single' that contain a submenu by displaying the
       * expanded submenu in the row actions dropdown
       */
      const singleActionsWithSubmenus = actions?.filter((action) => {
        return isSingleActionWithSubmenu(action, props.item)
      })
      let filteredActions = actions?.filter((action) => {
        return !isSingleActionWithSubmenu(action, props.item)
      })
      // Replace single action with its expanded submenu
      singleActionsWithSubmenus.forEach((action) => {
        const submenuActions = isSingleActionWithSubmenu(action, props.item)
        if (submenuActions !== undefined) {
          filteredActions = [
            ...submenuActions,
            { type: TypedActionType.seperator }, // Additional separator to distinguish the expanded submenu from the other actions
            ...filteredActions,
          ]
        }
      })

      return filteredActions ?? []
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
  }, [collapseButtons, actions, props.item])

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
            title: (
              <TypedActionButton
                action={{ ...buttonAction, tooltip: buttonAction.label }}
                selectedItem={props.item}
                iconOnly
              />
            ),
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
          const isHidden =
            buttonAction.isHidden !== undefined && props.item
              ? buttonAction.isHidden(props.item)
              : false
          if (isHidden) {
            return null
          }
          const Icon = buttonAction.icon
          let tooltip = buttonAction.tooltip
          const isDisabled =
            buttonAction.isDisabled !== undefined && props.item
              ? buttonAction.isDisabled(props.item)
              : false
          tooltip = isDisabled ? isDisabled : tooltip
          return {
            title: (
              <Tooltip
                key={buttonAction.label}
                content={tooltip}
                trigger={tooltip ? undefined : 'manual'}
              >
                <Split hasGutter style={{ cursor: isDisabled ? 'default' : 'pointer' }}>
                  {Icon && (
                    <SplitItem>
                      <IconWrapper color={isDisabled ? PFColorE.Disabled : undefined}>
                        <Icon />
                      </IconWrapper>
                    </SplitItem>
                  )}
                  <SplitItem style={{ color: isDisabled ? pfDisabled : undefined }}>
                    {buttonAction.label}
                  </SplitItem>
                </Split>
              </Tooltip>
            ),
            onClick: (event: Event) => {
              isDisabled ? event.stopPropagation() : buttonAction.onClick(props.item)
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
        case TypedActionType.plainText: {
          return {
            title: (
              <Split hasGutter style={{ cursor: 'default' }}>
                <SplitItem style={{ color: pfDisabled }}>{buttonAction.label}</SplitItem>
              </Split>
            ),
          }
        }
        default:
          return { isSeparator: true }
      }
    }),
  ].filter((i) => i !== null) as IAction[]
}

function isSingleActionWithSubmenu<T extends object>(
  action: ITypedAction<T>,
  item: T
): ITypedAction<T>[] | undefined {
  const submenu =
    action.type === TypedActionType.single && action.dropdownActions !== undefined && item
      ? action.dropdownActions(item)
      : undefined
  return submenu?.options && submenu.options.length > 0 ? submenu.options : undefined
}
