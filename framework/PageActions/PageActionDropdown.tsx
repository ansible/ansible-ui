import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Tooltip,
} from '@patternfly/react-core';
import { CircleIcon } from '@patternfly/react-icons';
import { ComponentClass, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from './PageAction';
import { PageActionSwitch } from './PageActionSwitch';
import { isPageActionHidden, usePageActionDisabled } from './PageActionUtils';
import styled from 'styled-components';

const IconSpan = styled.span`
  padding-right: 4px;
`;
const StyledDropdownItem = styled.div<{ hasSwitches: boolean; isDanger: boolean }>`
  --pf-c-dropdown__menu-item-icon--Width: ${({ hasSwitches }) =>
    hasSwitches ? '40px' : undefined};
  --pf-c-dropdown__menu-item-icon--MarginRight: ${({ hasSwitches }) =>
    hasSwitches ? '16px' : undefined};
  --pf-c-dropdown__menu-item--Color: ${({ isDanger }) =>
    isDanger ? 'var(--pf-global--danger-color--100)' : undefined};
`;

interface PageActionDropdownProps<T extends object> {
  actions: IPageAction<T>[];
  icon?: ComponentClass | FunctionComponent;
  iconOnly?: boolean;
  isDisabled?: string | undefined;
  label?: string;
  onOpen?: (label: string, open: boolean) => void;
  position?: DropdownPosition;
  selectedItem?: T;
  selectedItems?: T[];
  tooltip?: string;
  variant?: ButtonVariant;
}

export function PageActionDropdown<T extends object>(props: PageActionDropdownProps<T>) {
  const {
    icon,
    iconOnly,
    isDisabled,
    label,
    onOpen,
    position,
    selectedItem,
    selectedItems,
    tooltip,
    variant,
  } = props;

  let { actions } = props;
  actions = actions.filter((action) => !isPageActionHidden(action, selectedItem));
  actions = filterActionSeperators(actions);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hasBulkActions = useMemo(
    () =>
      !actions.every(
        (action) => !('selection' in action) || action.selection !== PageActionSelection.Multiple
      ),
    [actions]
  );
  const hasIcons = useMemo(
    () =>
      actions.find(
        (action) => action.type !== PageActionType.Seperator && action.icon !== undefined
      ) !== undefined,
    [actions]
  );
  const hasSwitches = useMemo(
    () =>
      actions.find(
        (action) =>
          action.type !== PageActionType.Seperator && action.type === PageActionType.Switch
      ) !== undefined,
    [actions]
  );

  useEffect(() => {
    onOpen?.(label ?? 'default', dropdownOpen);
  }, [dropdownOpen, label, onOpen, props]);

  if (actions.length === 0) return <></>;
  const Icon = icon;
  const toggleIcon = Icon ? <Icon /> : label;
  const isPrimary =
    variant === ButtonVariant.primary || (hasBulkActions && !!selectedItems?.length);
  /** Turn primary button to secondary if there are items selected */
  const isSecondary =
    variant === ButtonVariant.primary && !hasBulkActions && !!selectedItems?.length;
  const Toggle =
    label || Icon ? (
      <DropdownToggle
        id="toggle-dropdown"
        isDisabled={!!isDisabled}
        onToggle={() => setDropdownOpen(!dropdownOpen)}
        toggleVariant={isSecondary ? 'secondary' : isPrimary ? 'primary' : undefined}
        toggleIndicator={Icon && iconOnly ? null : undefined}
        style={isPrimary && !label ? { color: 'var(--pf-global--Color--light-100)' } : {}}
        icon={
          Icon ? (
            <div>
              <Icon />
            </div>
          ) : undefined
        }
      >
        {iconOnly ? undefined : label}
      </DropdownToggle>
    ) : (
      <KebabToggle
        className="toggle-kebab"
        isDisabled={!!isDisabled}
        onToggle={() => setDropdownOpen(!dropdownOpen)}
        toggleVariant={isPrimary ? 'primary' : undefined}
        style={isPrimary && !label ? { color: 'var(--pf-global--Color--light-100)' } : {}}
      >
        {toggleIcon}
      </KebabToggle>
    );
  const dropdown = (
    <Dropdown
      onSelect={() => setDropdownOpen(false)}
      toggle={Toggle}
      isOpen={dropdownOpen}
      isPlain={!label || iconOnly}
      dropdownItems={actions.map((action, index) => (
        <PageDropdownActionItem
          key={'label' in action ? action.label : `action-${index}`}
          action={action}
          selectedItems={selectedItems ?? []}
          selectedItem={selectedItem}
          hasIcons={hasIcons}
          hasSwitches={hasSwitches}
          index={index}
        />
      ))}
      position={position}
      // ZIndex 400 is needed for PF table stick headers
      style={{ zIndex: dropdownOpen ? 400 : undefined }}
    />
  );
  return tooltip && (iconOnly || isDisabled) ? (
    <Tooltip content={tooltip} trigger={tooltip ? undefined : 'manual'}>
      {dropdown}
    </Tooltip>
  ) : (
    { ...dropdown }
  );
}

function PageDropdownActionItem<T extends object>(props: {
  action: IPageAction<T>;
  selectedItems: T[];
  selectedItem?: T;
  hasIcons: boolean;
  hasSwitches: boolean;
  index: number;
}): JSX.Element {
  const { action, selectedItems, selectedItem, hasIcons, hasSwitches, index } = props;
  const isPageActionDisabled = usePageActionDisabled<T>();
  const isDisabled = isPageActionDisabled(action, selectedItem, selectedItems);

  switch (action.type) {
    case PageActionType.Button: {
      let Icon: ComponentClass | FunctionComponent | undefined = action.icon;
      if (!Icon && hasIcons) Icon = TransparentIcon;
      let tooltip = isDisabled ?? action.tooltip;
      let isButtonDisabled = !!isDisabled;
      if (action.selection === PageActionSelection.Multiple && !selectedItems.length) {
        tooltip = 'No selections';
        isButtonDisabled = true;
      }
      return (
        <Tooltip key={action.label} content={tooltip} trigger={tooltip ? undefined : 'manual'}>
          <StyledDropdownItem hasSwitches={hasSwitches} isDanger={Boolean(action.isDanger)}>
            <DropdownItem
              icon={
                Icon ? (
                  <IconSpan>
                    <Icon />
                  </IconSpan>
                ) : undefined
              }
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
              isAriaDisabled={isButtonDisabled}
            >
              {action.label}
            </DropdownItem>
          </StyledDropdownItem>
        </Tooltip>
      );
    }

    case PageActionType.Link: {
      let Icon: ComponentClass | FunctionComponent | undefined = action.icon;
      if (!Icon && hasIcons) Icon = TransparentIcon;
      const tooltip = isDisabled ? isDisabled : action.tooltip;
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
        <Tooltip key={action.label} content={tooltip} trigger={tooltip ? undefined : 'manual'}>
          <Link {...props} to={to}>
            <DropdownItem
              isAriaDisabled={Boolean(isDisabled)}
              icon={
                Icon ? (
                  <span style={{ paddingRight: 4 }}>
                    <Icon />
                  </span>
                ) : undefined
              }
              style={{
                color:
                  action.isDanger && !isDisabled
                    ? 'var(--pf-global--danger-color--100)'
                    : undefined,
              }}
            >
              {action.label}
            </DropdownItem>
          </Link>
        </Tooltip>
      );
    }

    case PageActionType.Switch: {
      return (
        <div style={{ marginLeft: 16, marginRight: 16, marginBottom: 16 }}>
          <PageActionSwitch action={action} selectedItem={selectedItem} />
        </div>
      );
    }

    case PageActionType.Dropdown: {
      const tooltip = action.label;
      return (
        <PageActionDropdown<T>
          key={action.label}
          label={action.label}
          actions={action.actions}
          selectedItem={selectedItem}
          selectedItems={selectedItems}
          isDisabled={isDisabled}
          tooltip={tooltip}
          // variant={action.variant}
        />
      );
    }

    case PageActionType.Seperator:
      return <DropdownSeparator key={`separator-${index}`} />;
  }
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />;

export function filterActionSeperators<T extends object>(actions: IPageAction<T>[]) {
  const filteredActions = [...actions];

  // Remove seperators at beginning of actions
  while (filteredActions.length > 0 && filteredActions[0].type === PageActionType.Seperator) {
    filteredActions.shift();
  }

  // Remove seperators at end of actions
  while (
    filteredActions.length > 0 &&
    filteredActions[filteredActions.length - 1].type === PageActionType.Seperator
  ) {
    filteredActions.pop();
  }

  // TODO remove two seperators in a row

  return filteredActions;
}
