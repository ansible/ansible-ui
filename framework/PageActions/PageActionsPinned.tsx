import { DropdownPosition, Split } from '@patternfly/react-core';
import { ComponentClass, FunctionComponent } from 'react';
import { IPageAction, PageActionType } from './PageAction';
import { PageActionButton } from './PageActionButton';
import { PageActionDropdown } from './PageActionDropdown';
import { PageActionLink } from './PageActionLink';
import { PageActionSwitch } from './PageActionSwitch';
import { usePageActionDisabled } from './PageActionUtils';

interface PageActionsPinnedProps<T extends object> {
  actions: IPageAction<T>[];
  selectedItem?: T;
  selectedItems?: T[];
  wrapper?: ComponentClass | FunctionComponent;

  /**
   * indicates to only show the icon for the action
   * Example: Table rows only show the icon but toolbars and details page actions show label
   */
  iconOnly?: boolean;

  /** Called when a dropdown is opened, allowing the parent to handle the z-index needed */
  onOpen?: (label: string, open: boolean) => void;
}

/** Pinned actions are actions that show up outside the dropdown at specific breakpoints */
export function PageActionsPinned<T extends object>(props: PageActionsPinnedProps<T>) {
  const { actions, selectedItems, selectedItem, wrapper, iconOnly, onOpen } = props;
  if (actions.length === 0) return <></>;
  return (
    <Split hasGutter={!iconOnly} style={{ alignItems: 'baseline' }}>
      {actions.map((action, index) => (
        <PageActionPinned<T>
          key={index}
          action={action}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          wrapper={wrapper}
          iconOnly={iconOnly}
          onOpen={onOpen}
        />
      ))}
    </Split>
  );
}

interface PageActionPinnedProps<T extends object> {
  action: IPageAction<T>;
  selectedItem?: T;
  selectedItems?: T[];
  wrapper?: ComponentClass | FunctionComponent;
  iconOnly?: boolean;

  /** Called when a dropdown is opened, allowing the parent to handle the z-index needed */
  onOpen?: (label: string, open: boolean) => void;
}

export function PageActionPinned<T extends object>(props: PageActionPinnedProps<T>): JSX.Element {
  const { action, selectedItems, selectedItem, wrapper, onOpen } = props;
  const isPageActionDisabled = usePageActionDisabled<T>();

  switch (action.type) {
    case PageActionType.Seperator:
      return <></>;

    case PageActionType.Button:
      return (
        <PageActionButton
          action={action}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      );

    case PageActionType.Link:
      return (
        <PageActionLink
          action={action}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          iconOnly={props.iconOnly}
          wrapper={wrapper}
        />
      );

    case PageActionType.Switch:
      return (
        <PageActionSwitch
          action={action}
          selectedItem={selectedItem}
          wrapper={wrapper}
          iconOnly={props.iconOnly}
        />
      );

    case PageActionType.Dropdown: {
      const isDisabled = isPageActionDisabled(action, selectedItem, selectedItems);
      const tooltip = isDisabled ? isDisabled : action.tooltip ? action.tooltip : action.label;
      return (
        <PageActionDropdown<T>
          icon={action.icon}
          label={action.label}
          actions={action.actions}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          iconOnly={props.iconOnly}
          position={DropdownPosition.right}
          tooltip={tooltip}
          isDisabled={isDisabled}
          variant={action.variant}
          onOpen={onOpen}
        />
      );
    }
  }
}
