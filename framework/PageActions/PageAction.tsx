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
}

export interface IPageActionSeperator {
  type: PageActionType.seperator;
}

export type IPageActionButton = IPageActionCommon & {
  type: PageActionType.button;
  variant?: ButtonVariant;
  onClick: () => void;
};

export type IPageBulkAction<T extends object> = IPageActionCommon & {
  type: PageActionType.bulk;
  variant?: ButtonVariant;
  onClick: (selectedItems: T[]) => void;
};

export type IPageSingleAction<T extends object> = IPageActionCommon & {
  type: PageActionType.single;
  variant?: ButtonVariant;
  onClick: (item: T) => void;
  isDisabled?: (item: T) => string;
  isHidden?: (item: T) => boolean;
};

export type IPageDropdownAction<T extends object> = IPageActionCommon & {
  type: PageActionType.dropdown;
  variant?: ButtonVariant;
  isHidden?: (item: T) => boolean;
  isDisabled?: (item: T) => string;
  options: IPageAction<T>[];
};
