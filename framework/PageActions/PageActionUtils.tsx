import { useCallback } from 'react';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IPageAction, PageActionSelection } from './PageAction';

export function isPageActionHidden<T extends object>(
  action: IPageAction<T>,
  selectedItem: T | undefined
): boolean {
  if (!('selection' in action)) {
    return false;
  }
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
      if (!('selection' in action)) {
        return;
      }
      if (typeof action.isDisabled === 'string') {
        return action.isDisabled;
      }
      if (!action.isDisabled) {
        return;
      }

      switch (action.selection) {
        case PageActionSelection.None:
          return action.isDisabled();

        case PageActionSelection.Single:
          if (!selectedItem) return translations.noSelection;
          return action.isDisabled(selectedItem);

        case PageActionSelection.Multiple:
          if (!selectedItems) return translations.noSelections;
          return action.isDisabled(selectedItems);
      }
    },
    [translations.noSelection, translations.noSelections]
  );
}
