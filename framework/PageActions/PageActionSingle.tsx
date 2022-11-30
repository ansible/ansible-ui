import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core'
import { ComponentClass, Fragment, FunctionComponent } from 'react'
import { IPageSingleAction } from './PageAction'

export function PageActionSingle<T extends object>(props: {
  action: IPageSingleAction<T>
  selectedItem?: T
  noPrimary?: boolean
  iconOnly?: boolean
  wrapper?: ComponentClass | FunctionComponent
}) {
  const { action, selectedItem, noPrimary, wrapper } = props
  const Wrapper = wrapper ?? Fragment
  const Icon = action.icon
  let tooltip = action.tooltip ?? props.iconOnly ? props.action.label : undefined
  const isDisabled =
    action.isDisabled !== undefined && selectedItem ? action.isDisabled(selectedItem) : false
  tooltip = isDisabled ? isDisabled : tooltip

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
          isAriaDisabled={Boolean(isDisabled)}
          onClick={() => selectedItem && action.onClick(selectedItem)}
          isDanger={action.isDanger}
        >
          {props.iconOnly && Icon ? <Icon /> : action.shortLabel ? action.shortLabel : action.label}
        </Button>
      </Tooltip>
    </Wrapper>
  )
}
