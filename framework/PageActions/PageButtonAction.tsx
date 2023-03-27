import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { IPageActionButton } from './PageAction';
import styled from 'styled-components';

const IconSpan = styled.span`
  padding-right: 4px;
`;

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
  let tooltip = action.tooltip ?? props.iconOnly ? props.action.label : undefined;
  const isDisabled = action.isDisabled !== undefined ? action.isDisabled : false;
  tooltip = isDisabled ? isDisabled : tooltip;

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
              <IconSpan>
                <Icon />
              </IconSpan>
            ) : undefined
          }
          isAriaDisabled={Boolean(isDisabled)}
          onClick={action.onClick ? action.onClick : undefined}
          component={action.href ? (props) => <Link {...props} to={action.href} /> : undefined}
        >
          {content}
        </Button>
      </Tooltip>
    </Wrapper>
  );
}
