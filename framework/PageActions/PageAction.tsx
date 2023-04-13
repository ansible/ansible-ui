import { ButtonVariant } from '@patternfly/react-core';
import { ComponentClass } from 'react';

export const enum PageActionType {
  Button,
  Link,
  Switch,
  Dropdown,
  Seperator,
}

export const enum PageActionSelection {
  /** Action that works without any selection context. i.e. create button in the toolbar */
  None,

  /** Action that works in the context of a single selection. i.e. row action or details page action */
  Single,

  /** Action that works in the context of multiple selection. i.e. bulk action in table toolbar */
  Multiple,
}

export type IPageAction<T extends object> =
  | IPageActionButton
  | IPageActionButtonSingle<T>
  | IPageActionButtonMultiple<T>
  | IPageActionLink
  | IPageActionLinkSingle<T>
  | IPageActionSwitch
  | IPageActionSwitchSingle<T>
  | IPageActionDropdown<T>
  | IPageActionDropdownSingle<T>
  | IPageActionDropdownMultiple<T>
  | IPageActionSeperator;

interface IPageActionCommon {
  icon?: ComponentClass;
  label: string;
  tooltip?: string;
  isDanger?: boolean;
  ouiaId?: string;
  isPinned?: boolean;
}

interface IPageActionNoneCommon extends IPageActionCommon {
  selection?: PageActionSelection.None;
  isHidden?: () => boolean;
  isDisabled?: string | (() => string | undefined);
}

interface IPageActionSingleCommon<T extends object> extends IPageActionCommon {
  selection?: PageActionSelection.Single;
  isHidden?: (item: T) => boolean;
  isDisabled?: string | ((item: T) => string | undefined);
}

interface IPageActionMultipleCommon<T extends object> extends IPageActionCommon {
  selection?: PageActionSelection.Multiple;
  isDisabled?: string | ((items: T[]) => string | undefined);
}

export interface IPageActionButton extends IPageActionNoneCommon {
  type: PageActionType.Button;
  selection: PageActionSelection.None;
  variant?: ButtonVariant;
  onClick: () => unknown | Promise<unknown>;
}

export interface IPageActionButtonSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Button;
  selection: PageActionSelection.Single;
  variant?: ButtonVariant;
  onClick: (item: T) => unknown | Promise<unknown>;
}

export interface IPageActionButtonMultiple<T extends object> extends IPageActionMultipleCommon<T> {
  type: PageActionType.Button;
  selection: PageActionSelection.Multiple;
  variant?: ButtonVariant;
  onClick: (items: T[]) => unknown | Promise<unknown>;
}

export interface IPageActionLink extends IPageActionNoneCommon {
  type: PageActionType.Link;
  href: string;
}

export interface IPageActionLinkSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Link;
  href: (item: T) => string;
}

export interface IPageActionSwitch extends IPageActionNoneCommon {
  type: PageActionType.Switch;
  onToggle: (enable: boolean) => unknown | Promise<unknown>;
  isSwitchOn: () => boolean;
  showPinnedLabel?: boolean;
  labelOff?: string;
}

export interface IPageActionSwitchSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Switch;
  onToggle: (item: T, enable: boolean) => unknown | Promise<unknown>;
  isSwitchOn: (item: T) => boolean;
  showPinnedLabel?: boolean;
  labelOff?: string;
}

export interface IPageActionDropdown<T extends object> extends IPageActionNoneCommon {
  type: PageActionType.Dropdown;
  actions: IPageAction<T>[];
}

export interface IPageActionDropdownSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Dropdown;
  actions: IPageAction<T>[];
}

export interface IPageActionDropdownMultiple<T extends object>
  extends IPageActionMultipleCommon<T> {
  type: PageActionType.Dropdown;
  actions: IPageAction<T>[];
}

export interface IPageActionSeperator {
  type: PageActionType.Seperator;
}
