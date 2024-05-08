import {
  ButtonVariant,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  DropdownPopperProps,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from '@patternfly/react-core';
import { CircleIcon, EllipsisVIcon } from '@patternfly/react-icons';
import { ComponentClass, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PFColorE, getPatternflyColor } from '../components/pfcolors';
import { getID } from '../hooks/useID';
import { IPageAction, PageActionSelection, PageActionType } from './PageAction';
import { PageActionSwitch } from './PageActionSwitch';
import { isPageActionHidden, usePageActionDisabled } from './PageActionUtils';

const StyledDropdownItem = styled.div<{ $hasSwitches: boolean; $isDanger: boolean }>`
  --pf-v5-c-dropdown__menu-item-icon--Width: ${({ $hasSwitches }) =>
    $hasSwitches ? '40px' : undefined};
  --pf-v5-c-dropdown__menu-item-icon--MarginRight: ${({ $hasSwitches }) =>
    $hasSwitches ? '16px' : undefined};
  --pf-v5-c-dropdown__menu-item--Color: ${({ $isDanger }) =>
    $isDanger ? 'var(--pf-v5-global--danger-color--100)' : undefined};
`;

const ActionSwitchDiv = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  margin-bottom: 16px;
`;

interface PageActionDropdownProps<T extends object> {
  actions: IPageAction<T>[];
  icon?: ComponentClass | FunctionComponent;
  iconOnly?: boolean;
  isDisabled?: string | undefined;
  label?: string;
  onOpen?: (label: string, open: boolean) => void;
  position?: DropdownPopperProps['position'];
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

  const id = getID(props.label ?? 'actions-dropdown');

  if (actions.length === 0) return <></>;

  const isPrimary =
    variant === ButtonVariant.primary || (hasBulkActions && !!selectedItems?.length);
  /** Turn primary button to secondary if there are items selected */
  const isSecondary =
    variant === ButtonVariant.primary && !hasBulkActions && !!selectedItems?.length;
  const isKebab = Boolean(!label && !icon);
  const CustomIcon = icon;

  let tooltipContent;
  if (isDisabled) {
    tooltipContent = isDisabled;
  } else if (tooltip) {
    tooltipContent = tooltip;
  } else if (iconOnly) {
    tooltipContent = label;
  } else {
    tooltipContent = undefined;
  }

  const dropdownMenuLabel: string | JSX.Element | undefined =
    iconOnly && CustomIcon ? (
      <Icon>
        <CustomIcon />
      </Icon>
    ) : (
      label
    );

  return (
    <Tooltip content={tooltipContent} trigger={tooltipContent ? undefined : 'manual'}>
      <Dropdown
        isOpen={dropdownOpen}
        onSelect={() => setDropdownOpen(false)}
        onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
        popperProps={{
          direction: 'down',
          position: position ?? 'right',
          enableFlip: true,
        }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            id={isKebab ? 'toggle-kebab' : 'toggle-dropdown'}
            isDisabled={!!isDisabled}
            aria-label={isKebab ? 'kebab dropdown toggle' : 'dropdown toggle'}
            variant={isSecondary ? 'secondary' : isPrimary ? 'primary' : 'plain'}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            isExpanded={dropdownOpen}
            style={isPrimary && !label ? { color: 'var(--pf-v5-global--Color--light-100)' } : {}}
            icon={
              CustomIcon ? (
                <Icon>
                  <CustomIcon />
                </Icon>
              ) : undefined
            }
          >
            {dropdownMenuLabel ?? <EllipsisVIcon />}
          </MenuToggle>
        )}
      >
        <DropdownList>
          {actions.map((action, index) => (
            <PageDropdownActionItem
              key={'label' in action ? action.label : `action-${index}`}
              action={action}
              selectedItems={selectedItems ?? []}
              selectedItem={selectedItem}
              hasIcons={hasIcons}
              hasSwitches={hasSwitches}
              index={index}
              data-cy={id}
            />
          ))}
        </DropdownList>
      </Dropdown>
    </Tooltip>
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
  const { t } = useTranslation();
  const isPageActionDisabled = usePageActionDisabled<T>();
  const isDisabled = isPageActionDisabled(action, selectedItem, selectedItems);

  switch (action.type) {
    case PageActionType.Button: {
      let CustomIcon: ComponentClass | FunctionComponent | undefined = action.icon;
      if (!CustomIcon && hasIcons) CustomIcon = TransparentIcon;
      let tooltip;

      if (isDisabled) {
        tooltip = isDisabled;
      } else if (action.tooltip) {
        tooltip = action.tooltip;
      } else if (action.icon) {
        tooltip = action.label;
      } else {
        tooltip = undefined;
      }

      let isButtonDisabled = !!isDisabled;
      if (action.selection === PageActionSelection.Multiple && !selectedItems.length) {
        tooltip = t(`Select at least one item from the list`);
        isButtonDisabled = true;
      }
      return (
        <StyledDropdownItem $hasSwitches={hasSwitches} $isDanger={Boolean(action.isDanger)}>
          <DropdownItem
            id={getID(action)}
            data-cy={getID(action)?.split('.').join('-')}
            isDisabled={Boolean(isButtonDisabled)}
            isAriaDisabled={Boolean(isButtonDisabled)}
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
            style={{
              color:
                action.isDanger && !isDisabled ? getPatternflyColor(PFColorE.Danger) : undefined,
            }}
            tooltipProps={{
              content: tooltip,
              trigger: tooltip ? undefined : 'manual',
            }}
          >
            {CustomIcon ? (
              <Icon
                size="lg"
                iconSize="md"
                style={{
                  paddingRight: '.5rem',
                }}
              >
                <CustomIcon />
              </Icon>
            ) : undefined}
            {action.label}
          </DropdownItem>
        </StyledDropdownItem>
      );
    }

    case PageActionType.Link: {
      let CustomIcon: ComponentClass | FunctionComponent | undefined = action.icon;
      if (!CustomIcon && hasIcons) CustomIcon = TransparentIcon;
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
        <DropdownItem
          isDisabled={Boolean(isDisabled)}
          isAriaDisabled={Boolean(isDisabled)}
          to={to}
          style={{
            color: action.isDanger && !isDisabled ? getPatternflyColor(PFColorE.Danger) : undefined,
          }}
          tooltipProps={{
            content: tooltip,
            trigger: tooltip ? undefined : 'manual',
          }}
        >
          {CustomIcon ? (
            <Icon
              size="lg"
              iconSize="md"
              style={{
                paddingRight: '.5rem',
              }}
            >
              <CustomIcon />
            </Icon>
          ) : undefined}
          {action.label}
        </DropdownItem>
      );
    }

    case PageActionType.Switch: {
      return (
        <ActionSwitchDiv>
          <PageActionSwitch action={action} selectedItem={selectedItem} />
        </ActionSwitchDiv>
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
      return <Divider component="li" key={`separator-${index}`} />;
  }
}

const TransparentIcon = () => <CircleIcon style={{ opacity: 0 }} />;

export function filterActionSeperators<T extends object>(actions: IPageAction<T>[]) {
  let filteredActions = [...actions];

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

  // Remove two seperators side by side
  filteredActions = collapseAdjacentSeperators(filteredActions);

  return filteredActions;
}

function collapseAdjacentSeperators<T extends object>(actions: IPageAction<T>[]): IPageAction<T>[] {
  const result: IPageAction<T>[] = [];
  let previousAction: IPageAction<T> | undefined;
  for (const action of actions) {
    if (action.type === PageActionType.Seperator) {
      if (!previousAction || previousAction.type !== PageActionType.Seperator) {
        result.push(action);
      }
    } else {
      result.push(action);
    }
    previousAction = action;
  }
  return result;
}
