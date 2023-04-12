import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import styled from 'styled-components';
import {
  IPageActionButton,
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  PageActionSelection,
} from './PageAction';
import { usePageActionDisabled } from './PageActionUtils';

const IconSpan = styled.span`
  padding-right: 4px;
`;

export function PageActionButton<T extends object>(props: {
  action: IPageActionButton | IPageActionButtonSingle<T> | IPageActionButtonMultiple<T>;

  /** Turn primary buttons to secondary if there are items selected */
  isSecondary?: boolean;

  wrapper?: ComponentClass | FunctionComponent;

  iconOnly?: boolean;

  selectedItem?: T;
  selectedItems?: T[];
}) {
  const { action, isSecondary, wrapper, iconOnly, selectedItem, selectedItems } = props;

  const isPageActionDisabled = usePageActionDisabled<T>();
  const isDisabled = isPageActionDisabled(action, selectedItem, selectedItems);

  const Wrapper = wrapper ?? Fragment;
  const Icon = action.icon;
  const tooltip = isDisabled
    ? isDisabled
    : action.tooltip
    ? action.tooltip
    : iconOnly
    ? action.label
    : undefined;

  let variant = action.variant ?? ButtonVariant.secondary;
  if (isSecondary && [ButtonVariant.primary, ButtonVariant.danger].includes(variant)) {
    variant = ButtonVariant.secondary;
  }
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger;
  }
  if (iconOnly) {
    variant = ButtonVariant.plain;
  }

  const id = action.label.toLowerCase().split(' ').join('-');
  const content = iconOnly && Icon ? <Icon /> : action.label;

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
          isAriaDisabled={!!isDisabled}
          onClick={() => {
            switch (action.selection) {
              case PageActionSelection.None:
                action.onClick();
                break;
              case PageActionSelection.Single:
                if (selectedItem) action.onClick(selectedItem);
                break;
              case PageActionSelection.Multiple:
                if (selectedItems) action.onClick(selectedItems);
                break;
            }
          }}
        >
          {content}
        </Button>
      </Tooltip>
    </Wrapper>
  );
}
