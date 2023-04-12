import { ButtonVariant } from '@patternfly/react-core';
import { ComponentClass } from 'react';

export const enum PageActionType {
  Seperator,
  Button,
  Single,
  Link,
  SingleLink,
  Bulk,
  Dropdown,
  Switch,
}

export const enum PageActionSelection {
  None,
  Single,
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
  isDisabled?: () => string | undefined;
}

interface IPageActionSingleCommon<T extends object> extends IPageActionCommon {
  selection?: PageActionSelection.Single;
  isHidden?: (item: T) => boolean;
  isDisabled?: (item: T) => string | undefined;
}

interface IPageActionMultipleCommon<T extends object> extends IPageActionCommon {
  selection?: PageActionSelection.Multiple;
  isDisabled?: (items: T[]) => string | undefined;
}

export interface IPageActionButton extends IPageActionNoneCommon {
  type: PageActionType.Button;
  variant?: ButtonVariant;
  onClick: () => unknown | Promise<unknown>;
}

export interface IPageActionButtonSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Button;
  variant?: ButtonVariant;
  onClick: (item: T) => unknown | Promise<unknown>;
}

export interface IPageActionButtonMultiple<T extends object> extends IPageActionMultipleCommon<T> {
  type: PageActionType.Button;
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
  onToggle: () => unknown | Promise<unknown>;
  isSwitchOn: () => boolean | Promise<boolean>;
}

export interface IPageActionSwitchSingle<T extends object> extends IPageActionSingleCommon<T> {
  type: PageActionType.Switch;
  onToggle: (item: T) => boolean | Promise<boolean>;
  isSwitchOn: (item: T) => boolean;
}

export interface IPageActionDropdown<T extends object> extends IPageActionCommon {
  type: PageActionType.Dropdown;
  actions: IPageAction<T>[];
}

export interface IPageActionSeperator {
  type: PageActionType.Seperator;
}
