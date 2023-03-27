import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import { IPageBulkAction } from './PageAction';
import styled from 'styled-components';

const IconSpan = styled.span`
  padding-right: 4px;
`;

export function PageBulkAction<T extends object>(props: {
  action: IPageBulkAction<T>;
  selectedItems?: T[];
  wrapper?: ComponentClass | FunctionComponent;
}) {
  const { action, selectedItems, wrapper } = props;
  const Wrapper = wrapper ?? Fragment;
  const Icon = action.icon;
  let tooltip = action.tooltip;
  let isDisabled = false;
  let variant = action.variant ?? ButtonVariant.secondary;
  if (variant === ButtonVariant.primary && action.isDanger) {
    variant = ButtonVariant.danger;
  }
  if (!selectedItems || !selectedItems.length) {
    tooltip = 'No selections';
    isDisabled = true;
  }
  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          variant={variant}
          icon={
            Icon ? (
              <IconSpan>
                <Icon />
              </IconSpan>
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
  );
}
