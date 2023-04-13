import { useCallback } from 'react';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IPageAction, PageActionSelection } from './PageAction';

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

      case undefined:
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
  const [translations] = useFrameworkTranslations();
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
              if (!selectedItem) return translations.noSelection;
              return action.isDisabled(selectedItem);
            }
            break;

          case PageActionSelection.Multiple:
            if (typeof action.isDisabled === 'string') {
              return action.isDisabled;
            }
            if (action.isDisabled) {
              if (!selectedItems) return translations.noSelections;
              return action.isDisabled(selectedItems);
            }
            break;
        }
      }
    },
    [translations.noSelection, translations.noSelections]
  );
}
