import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

export interface IFrameworkTranslations {
  by: string;
  cancelText: string;
  canceledText: string;
  cardView: string;
  clearAllFilters: string;
  clickToRefresh: string;
  closeText: string;
  confirmText: string;
  countMore: string;
  documentation: string;
  errorText: string;
  filter: string;
  listView: string;
  manageColumns: string;
  moreInformation: string;
  noItemsFound: string;
  noResultsFound: string;
  noResultsMatchCriteria: string;
  noSelection: string;
  noSelections: string;
  ofText: string;
  pendingText: string;
  pleaseFixValidationErrors: string;
  processingText: string;
  selectNone: string;
  selectedText: string;
  showLess: string;
  sort: string;
  submitText: string;
  submittingText: string;
  successText: string;
  tableView: string;
  unknownError: string;
  validating: string;
}

const defaultTranslations: IFrameworkTranslations = {
  by: 'by',
  cancelText: 'Cancel',
  canceledText: 'Canceled',
  cardView: 'Card view',
  clearAllFilters: 'Clear all filters',
  clickToRefresh: 'Click to refresh',
  closeText: 'Close',
  confirmText: 'Confirm',
  countMore: '{count} more',
  documentation: 'Documentation',
  errorText: 'Error',
  filter: 'Filter',
  listView: 'List view',
  manageColumns: 'Manage columns',
  moreInformation: 'More information',
  noItemsFound: 'No items found',
  noResultsFound: 'No results found',
  noResultsMatchCriteria: 'No results match this filter criteria. Clear all filters and try again.',
  noSelection: 'No selection',
  noSelections: 'No selections',
  ofText: 'of',
  pendingText: 'Pending',
  pleaseFixValidationErrors: 'Please fix validation errors.',
  processingText: 'Processing',
  selectNone: 'Select none',
  selectedText: 'Selected',
  showLess: 'Show less',
  sort: 'Sort',
  submitText: 'Submit',
  submittingText: 'Submitting',
  successText: 'Success',
  tableView: 'Table view',
  unknownError: 'Unknown error',
  validating: 'Validating...',
};

const FrameworkTranslationsContext = createContext<
  [
    translations: IFrameworkTranslations,
    setTranslations: Dispatch<SetStateAction<IFrameworkTranslations>>
  ]
>([defaultTranslations, () => alert('Use FrameworkTranslationsProvider')]);

export function FrameworkTranslationsProvider(props: { children: ReactNode }) {
  const state = useState<IFrameworkTranslations>(defaultTranslations);
  return (
    <FrameworkTranslationsContext.Provider value={state}>
      {props.children}
    </FrameworkTranslationsContext.Provider>
  );
}

export function useFrameworkTranslations() {
  return useContext(FrameworkTranslationsContext);
}
