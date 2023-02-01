import { ButtonVariant } from '@patternfly/react-core';
import { ComponentClass } from 'react';
import { PageActionType } from './PageActionType';

export type IPageAction<T extends object> =
  | IPageActionSeperator
  | IPageActionButton
  | IPageBulkAction<T>
  | IPageSingleAction<T>
  | IPageDropdownAction<T>;

export interface IPageActionCommon {
  icon?: ComponentClass;
  label: string;
  shortLabel?: string;
  tooltip?: string;
  isDanger?: boolean;
  ouiaId?: string;
}

export interface IPageActionSeperator {
  type: PageActionType.seperator;
}

type IPageActionWithLink = IPageActionCommon & {
  type: PageActionType.button;
  variant?: ButtonVariant;
  isDisabled?: string | undefined;
  href: string;
  onClick?: never;
};
type IPageActionWithOnClick = IPageActionCommon & {
  type: PageActionType.button;
  variant?: ButtonVariant;
  isDisabled?: string | undefined;
  onClick: (() => void) | (() => Promise<unknown>);
  href?: never;
};
export type IPageActionButton = IPageActionWithLink | IPageActionWithOnClick;

export type IPageBulkAction<T extends object> = IPageActionCommon & {
  type: PageActionType.bulk;
  variant?: ButtonVariant;
  onClick: (selectedItems: T[]) => void;
};

type IPageSingleActionWithLink<T extends object> = IPageActionCommon & {
  type: PageActionType.singleLink;
  variant?: ButtonVariant;
  href: (item: T) => string;
  onClick?: never;
  isDisabled?: (item: T) => string | undefined;
  isHidden?: (item: T) => boolean;
};
type IPageSingleActionWithOnClick<T extends object> = IPageActionCommon & {
  type: PageActionType.single;
  variant?: ButtonVariant;
  onClick: (item: T) => void | (() => Promise<unknown>);
  href?: never;
  isDisabled?: (item: T) => string | undefined;
  isHidden?: (item: T) => boolean;
};
export type IPageSingleAction<T extends object> =
  | IPageSingleActionWithLink<T>
  | IPageSingleActionWithOnClick<T>;

export type IPageDropdownAction<T extends object> = IPageActionCommon & {
  type: PageActionType.dropdown;
  variant?: ButtonVariant;
  isHidden?: (item: T) => boolean;
  isDisabled?: (item: T) => string;
  options: IPageAction<T>[];
};
