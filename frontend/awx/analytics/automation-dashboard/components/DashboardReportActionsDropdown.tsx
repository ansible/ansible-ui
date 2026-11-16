import {
  IPageAction,
  IPageActionDropdown,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { Divider, Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
import { ReactNode, useRef, useState } from 'react';
import { IDashboardReportAction } from '../common/useAutomationDashboardToolbarActions';
import { IJobTemplate } from '../types';

/** Same id format the framework page actions use, so existing selectors keep working. */
function toTestId(label: string): string {
  return label.toLowerCase().replace(/[ _.]/g, '-');
}

function isReportAction(action: IPageAction<IJobTemplate>): action is IDashboardReportAction {
  return action.type === PageActionType.Button && action.selection === PageActionSelection.None;
}

function getDisabledReason(action: IDashboardReportAction): string | undefined {
  return typeof action.isDisabled === 'function' ? action.isDisabled() : action.isDisabled;
}

function ReportActionItem(props: Readonly<{ action: IDashboardReportAction }>) {
  const { action } = props;
  const disabledReason = getDisabledReason(action);
  const ItemIcon = action.icon;
  const testId = toTestId(action.label);
  return (
    <DropdownItem
      id={testId}
      data-cy={testId}
      data-testid={testId}
      icon={ItemIcon ? <ItemIcon /> : undefined}
      description={disabledReason ? undefined : action.description}
      isAriaDisabled={Boolean(disabledReason)}
      isDanger={action.isDanger && !disabledReason}
      tooltipProps={disabledReason ? { content: disabledReason } : undefined}
      onClick={() => action.onClick()}
    >
      {action.label}
    </DropdownItem>
  );
}

/**
 * Renders the menu items. A separator has no label of its own, so its key comes from the
 * item before it, which stays stable when items are added or removed elsewhere.
 */
function renderMenuItems(actions: IPageAction<IJobTemplate>[]): ReactNode[] {
  const items: ReactNode[] = [];
  let previousLabel = 'start';
  for (const item of actions) {
    if (item.type === PageActionType.Seperator) {
      items.push(<Divider component="li" key={`separator-after-${previousLabel}`} />);
    } else if (isReportAction(item)) {
      items.push(<ReportActionItem key={item.label} action={item} />);
      previousLabel = item.label;
    }
  }
  return items;
}

/**
 * Report actions menu for the automation dashboard toolbar. Unlike the framework page
 * action dropdown, it shows each action's description under its label.
 */
export function DashboardReportActionsDropdown(
  props: Readonly<{ action: IPageActionDropdown<IJobTemplate> }>
) {
  const { action } = props;
  const [isOpen, setIsOpen] = useState(false);
  const ToggleIcon = action.icon;
  const toggleId = toTestId(action.label);
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      popperProps={{
        appendTo: () => document.body,
        preventOverflow: true,
        enableFlip: true,
        maxWidth: '300px',
      }}
      toggle={{
        toggleRef,
        toggleNode: (
          <MenuToggle
            ref={toggleRef}
            data-cy={toggleId}
            data-testid={toggleId}
            variant="primary"
            isExpanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            icon={ToggleIcon ? <ToggleIcon /> : undefined}
          >
            {action.label}
          </MenuToggle>
        ),
      }}
    >
      <DropdownList>{renderMenuItems(action.actions)}</DropdownList>
    </Dropdown>
  );
}
