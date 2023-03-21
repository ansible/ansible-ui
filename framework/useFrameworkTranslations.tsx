import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

export interface IFrameworkTranslations {
  cancelText: string;
  canceledText: string;
  closeText: string;
  confirmText: string;
  errorText: string;
  noItemsFound: string;
  ofText: string;
  pendingText: string;
  processingText: string;
  selectedText: string;
  submitText: string;
  submittingText: string;
  successText: string;
  manageColumns: string;
  moreInformation: string;
  showLess: string;
  countMore: string;
  documentation: string;
  noResultsFound: string;
  noResultsMatchCriteria: string;
  clearAllFilters: string;
  by: string;
  selectNone: string;
  pleaseFixValidationErrors: string;
  validating: string;
  clickToRefresh: string;
  unknownError: string;
}

const defaultTranslations: IFrameworkTranslations = {
  by: 'by',
  cancelText: 'Cancel',
  canceledText: 'Canceled',
  clearAllFilters: 'Clear all filters',
  clickToRefresh: 'Click to refresh',
  closeText: 'Close',
  confirmText: 'Confirm',
  countMore: '{count} more',
  documentation: 'Documentation',
  errorText: 'Error',
  manageColumns: 'Manage columns',
  moreInformation: 'More information',
  noItemsFound: 'No items found',
  noResultsFound: 'No results found',
  noResultsMatchCriteria: 'No results match this filter criteria. Clear all filters and try again.',
  ofText: 'of',
  pendingText: 'Pending',
  pleaseFixValidationErrors: 'Please fix validation errors.',
  processingText: 'Processing',
  selectNone: 'Select none',
  selectedText: 'Selected',
  showLess: 'Show less',
  submitText: 'Submit',
  submittingText: 'Submitting',
  successText: 'Success',
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
