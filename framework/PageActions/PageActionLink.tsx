import { Button, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IPageActionLink, IPageActionLinkSingle, PageActionSelection } from './PageAction';
import { usePageActionDisabled } from './PageActionUtils';

const IconSpan = styled.span`
  padding-right: 4px;
`;

export function PageActionLink<T extends object>(props: {
  action: IPageActionLink | IPageActionLinkSingle<T>;
  wrapper?: ComponentClass | FunctionComponent;
  iconOnly?: boolean;
  selectedItem?: T;
  selectedItems?: T[];
}) {
  const { action, wrapper, iconOnly, selectedItem, selectedItems } = props;

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

  const id = action.label.toLowerCase().split(' ').join('-');
  const content = iconOnly && Icon ? <Icon /> : action.label;

  let to: string;

  switch (action.selection) {
    case PageActionSelection.None:
      to = action.href;
      break;
    case PageActionSelection.Single:
      if (selectedItem) {
        to = action.href(selectedItem);
      } else to = '';
      break;
    default:
      to = '';
      break;
  }

  return (
    <Wrapper>
      <Button
        id={id}
        isDanger={action.isDanger}
        icon={
          Icon ? (
            <IconSpan>
              <Icon />
            </IconSpan>
          ) : undefined
        }
        isAriaDisabled={Boolean(isDisabled)}
        component={(props) => (
          <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
            <Link {...props} to={to} />
          </Tooltip>
        )}
        variant={iconOnly ? 'plain' : undefined}
      >
        {iconOnly && Icon ? <Icon /> : content}
      </Button>
    </Wrapper>
  );
}
