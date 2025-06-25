import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { ComponentClass, Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router';
import { useID } from '../hooks/useID';
import {
  IPageActionButton,
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  IPageActionLink,
  IPageActionLinkSingle,
  PageActionSelection,
  PageActionType,
} from './PageAction';
import { usePageActionDisabled } from './PageActionUtils';
import { useTranslation } from 'react-i18next';

export function PageActionButton<T extends object>(props: {
  action:
    | IPageActionButton
    | IPageActionButtonSingle<T>
    | IPageActionButtonMultiple<T>
    | IPageActionLink
    | IPageActionLinkSingle<T>;

  /** Turn primary buttons to secondary if there are items selected */
  isSecondary?: boolean;

  wrapper?: ComponentClass | FunctionComponent;

  iconOnly?: boolean;

  selectedItem?: T;
  selectedItems?: T[];

  isLink?: boolean;
}) {
  const { action, isSecondary, wrapper, iconOnly, selectedItem, selectedItems } = props;

  const isPageActionDisabled = usePageActionDisabled<T>();
  const isDisabled = isPageActionDisabled(action, selectedItem, selectedItems);

  const Wrapper = wrapper ?? Fragment;
  const Icon = action.icon;
  const { t } = useTranslation();

  const isEmptyMultiSelect =
    action.selection === PageActionSelection.Multiple && !selectedItems?.length;

  const getTooltip = () => {
    if (isEmptyMultiSelect) {
      return t(`Select at least one item from the list`);
    }
    if (isDisabled) {
      return isDisabled;
    }
    if (action.tooltip) {
      return action.tooltip;
    }
    if (iconOnly) {
      return action.label;
    }
    return undefined;
  };
  const tooltip = getTooltip();

  const isButtonDisabled = !!isDisabled || isEmptyMultiSelect;

  const getVariant = () => {
    const variant = action.variant ?? ButtonVariant.secondary;
    if (isSecondary && [ButtonVariant.primary, ButtonVariant.danger].includes(variant)) {
      return ButtonVariant.secondary;
    }
    if (variant === ButtonVariant.primary && action.isDanger) {
      return ButtonVariant.danger;
    }
    if (iconOnly) {
      return ButtonVariant.plain;
    }
    return variant;
  };
  const variant = getVariant();

  const getTo = () => {
    if (action.type !== PageActionType.Link) {
      return undefined;
    }
    switch (action.selection) {
      case PageActionSelection.None:
        return action.href;
      case PageActionSelection.Single:
        return selectedItem ? action.href(selectedItem) : '';
      default:
        return '';
    }
  };
  const to = getTo();

  const id = useID(action);
  const content = iconOnly && Icon ? <Icon /> : action.label;

  return (
    <Wrapper>
      <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
        <Button
          id={id}
          data-cy={id}
          variant={variant}
          isDanger={action.isDanger}
          icon={Icon ? <Icon /> : undefined}
          isAriaDisabled={isButtonDisabled}
          onClick={() => {
            if (action.type !== PageActionType.Link) {
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
            }
          }}
          aria-label={iconOnly ? action.label : ''}
          ouiaId={id}
          component={
            action.type === PageActionType.Link ? (p) => <Link {...p} to={to} /> : undefined
          }
        >
          {content}
        </Button>
      </Tooltip>
    </Wrapper>
  );
}
