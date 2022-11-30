import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core'
import { ComponentClass, Fragment, FunctionComponent } from 'react'
import { IPageActionButton } from './PageAction'

export function PageActionButton<T extends object>(props: {
  action: IPageActionButton
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
