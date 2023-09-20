import { useCallback } from 'react';
import { IPageAction, PageActionSelection } from './PageAction';
import { useTranslation } from 'react-i18next';

export function isPageActionHidden<T extends object>(
  action: IPageAction<T>,
  selectedItem: T | undefined
): boolean {
  if ('selection' in action) {
    switch (action.selection) {
      case PageActionSelection.None:
        if (action.isHidden) {
          return action.isHidden();
        }
        break;

      case PageActionSelection.Single:
        if (action.isHidden) {
          if (!selectedItem) return true;
          return action.isHidden(selectedItem);
        }
        break;
    }
  }
  return false;
}

export function usePageActionDisabled<T extends object>() {
  const { t } = useTranslation();
  return useCallback(
    (
      action: IPageAction<T>,
      selectedItem: T | undefined,
      selectedItems?: T[] | undefined
    ): string | undefined => {
      if ('selection' in action) {
        switch (action.selection) {
          case PageActionSelection.None:
            if (typeof action.isDisabled === 'string') {
              return action.isDisabled;
            }
            if (action.isDisabled) {
              return action.isDisabled();
            }
            break;

          case PageActionSelection.Single:
            if (typeof action.isDisabled === 'string') {
              return action.isDisabled;
            }
            if (action.isDisabled) {
              if (!selectedItem) return t('No selection');
              return action.isDisabled(selectedItem);
            }
            break;

          case PageActionSelection.Multiple:
            if (typeof action.isDisabled === 'string') {
              return action.isDisabled;
            }
            if (action.isDisabled) {
              if (!selectedItems) return t('No selections');
              return action.isDisabled(selectedItems);
            }
            break;
        }
      }
    },
    [t]
  );
}
