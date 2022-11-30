import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Tooltip,
} from '@patternfly/react-core'
import { CircleIcon } from '@patternfly/react-icons'
import { ComponentClass, FunctionComponent, useMemo, useState } from 'react'
import { IPageAction } from './PageAction'
import { PageActionType } from './PageActionType'

export function PageActionsDropdown<T extends object>(props: {
  actions: IPageAction<T>[]
  label?: string
  icon?: ComponentClass | FunctionComponent
  isDisabled?: boolean
  tooltip?: string
  isPrimary?: boolean
  selectedItems?: T[]
  selectedItem?: T
  position?: DropdownPosition
  iconOnly?: boolean
}) {
  const {
    actions,
    label,
    icon,
    isPrimary = false,
    selectedItems,
    selectedItem,
    iconOnly,
    isDisabled,
    tooltip,
  } = props
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hasItemActions = useMemo(
    () => !actions.every((action) => action.type !== PageActionType.bulk),
    [actions]
  )
  const hasIcons = useMemo(
    () =>
      actions.find(
        (action) => action.type !== PageActionType.seperator && action.icon !== undefined
      ) !== undefined,
    [actions]
  )
  if (actions.length === 0) return <></>
  const Icon = icon
  const Toggle = label || Icon ? DropdownToggle : KebabToggle

  const dropdown = (
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
      isPlain={!label || iconOnly}
      dropdownItems={actions.map((action, index) => (
        <PageActionDropdownItem
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
      }}
    />
  )
  return tooltip && (iconOnly || isDisabled) ? (
    <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
      {dropdown}
    </Tooltip>
  ) : (
    { ...dropdown }
  )
}

function PageActionDropdownItem<T extends object>(props: {
  action: IPageAction<T>
  selectedItems: T[]
  selectedItem?: T
  hasIcons: boolean
  index: number
}) {
  const { action, selectedItems, selectedItem, hasIcons, index } = props

  switch (action.type) {
    case PageActionType.single: {
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

    case PageActionType.button:
    case PageActionType.bulk: {
      let Icon: ComponentClass | FunctionComponent | undefined = action.icon
      if (!Icon && hasIcons) Icon = TransparentIcon
      let tooltip = action.tooltip
      let isDisabled = false
      if (action.type === PageActionType.bulk && !selectedItems.length) {
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
    case PageActionType.dropdown: {
      const isHidden =
        action.isHidden !== undefined && selectedItem ? action.isHidden(selectedItem) : false
      if (isHidden) {
        return null
      }
      let tooltip = action.label
      const isDisabled =
        action.isDisabled !== undefined && selectedItem ? action.isDisabled(selectedItem) : ''
      tooltip = isDisabled ? isDisabled : tooltip
      return (
        <PageActionsDropdown<T>
          key={action.label}
          label={action.label}
          actions={action.options}
          selectedItem={selectedItem}
          isDisabled={Boolean(isDisabled)}
          tooltip={tooltip}
        />
      )
    }
    case PageActionType.seperator:
      return <DropdownSeparator key={`separator-${index}`} />
    default:
      return <></>
  }
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />
