import { DropdownPosition, Split } from '@patternfly/react-core';
import { ComponentClass, FunctionComponent } from 'react';
import { IPageAction } from './PageAction';
import { PageActionType } from './PageActionType';
import { PageBulkAction } from './PageBulkAction';
import { PageButtonAction } from './PageButtonAction';
import { PageDropdownAction } from './PageDropdownAction';
import { PageSingleAction } from './PageSingleAction';

export function PagePinnedActions<T extends object>(props: {
  actions: IPageAction<T>[];
  selectedItem?: T;
  selectedItems?: T[];
  wrapper?: ComponentClass | FunctionComponent;

  /**
   * indicates to only show the icon for the action
   * Example: Table rows only show the icon but toolbars and details page actions show label
   */
  iconOnly?: boolean;
}) {
  const { actions, selectedItems, selectedItem, wrapper, iconOnly } = props;
  if (actions.length === 0) return <></>;
  return (
    <Split hasGutter>
      {actions.map((action, index) => (
        <PagePinnedAction
          key={index}
          action={action}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          wrapper={wrapper}
          iconOnly={iconOnly}
        />
      ))}
    </Split>
  );
}

export function PagePinnedAction<T extends object>(props: {
  action: IPageAction<T>;
  selectedItem?: T;
  selectedItems?: T[];
  wrapper?: ComponentClass | FunctionComponent;
  iconOnly?: boolean;
}) {
  const { action, selectedItems, selectedItem, wrapper } = props;

  switch (action.type) {
    case PageActionType.seperator: {
      return <></>;
    }
    case PageActionType.single: {
      return (
        <PageSingleAction
          action={action}
          selectedItem={selectedItem}
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      );
    }
    case PageActionType.bulk: {
      return (
        <PageBulkAction
          action={action}
          selectedItems={selectedItems}
          // iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      );
    }
    case PageActionType.button: {
      return (
        <PageButtonAction
          action={action}
          isSecondary={
            (selectedItems !== undefined && selectedItems.length !== 0) ||
            selectedItem !== undefined
          }
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      );
    }
    case PageActionType.dropdown: {
      let tooltip = action.label;
      const isDisabled =
        action.isDisabled !== undefined && selectedItem ? action.isDisabled(selectedItem) : '';
      tooltip = isDisabled ? isDisabled : tooltip;
      return (
        <PageDropdownAction<T>
          icon={action.icon}
          label={action.label}
          actions={action.options}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          iconOnly={props.iconOnly}
          position={DropdownPosition.right}
          isDisabled={Boolean(isDisabled)}
          tooltip={props.iconOnly || isDisabled ? tooltip : undefined}
          // isPrimary={action.variant === ButtonVariant.primary && !selectedItems?.length}
        />
      );
    }
  }
}
