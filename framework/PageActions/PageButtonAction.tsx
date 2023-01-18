import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { IPageActionButton } from './PageAction';

export function PageButtonAction(props: {
  action: IPageActionButton;

  /** Turn primary buttons to secondary if there are items selected */
  isSecondary?: boolean;

  wrapper?: ComponentClass | FunctionComponent;

  iconOnly?: boolean;
}) {
  const { action, isSecondary, wrapper } = props;
  const Wrapper = wrapper ?? Fragment;
  const Icon = action.icon;
  const tooltip = action.tooltip ?? props.iconOnly ? props.action.label : undefined;
  const isDisabled = false;
  let variant = action.variant ?? ButtonVariant.secondary;
  if (isSecondary && [ButtonVariant.primary, ButtonVariant.danger].includes(variant)) {
    variant = ButtonVariant.secondary;
  }
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger;
  }
  if (props.iconOnly) {
    variant = ButtonVariant.plain;
  }

  const id = props.action.label.toLowerCase().split(' ').join('-');
  const content =
    props.iconOnly && Icon ? <Icon /> : action.shortLabel ? action.shortLabel : action.label;

  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          id={id}
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
          onClick={action.onClick ? action.onClick : undefined}
          component={action.href ? (props) => <Link {...props} to={action.href} /> : undefined}
        >
          {content}
        </Button>
      </Tooltip>
    </Wrapper>
  );
}
