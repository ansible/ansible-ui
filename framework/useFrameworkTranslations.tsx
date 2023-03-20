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
}

const defaultTranslations: IFrameworkTranslations = {
  cancelText: 'Cancel',
  canceledText: 'Canceled',
  closeText: 'Close',
  confirmText: 'Confirm',
  errorText: 'Error',
  noItemsFound: 'No items found',
  ofText: 'of',
  pendingText: 'Pending',
  processingText: 'Processing',
  selectedText: 'Selected',
  submitText: 'Submit',
  submittingText: 'Submitting',
  successText: 'Success',
  manageColumns: 'Manage columns',
  moreInformation: 'More information',
  showLess: 'Show less',
  countMore: '{count} more',
  documentation: 'Documentation',
  noResultsFound: 'No results found',
  noResultsMatchCriteria: 'No results match this filter criteria. Clear all filters and try again.',
  clearAllFilters: 'Clear all filters',
  by: 'by',
  selectNone: 'Select none',
  pleaseFixValidationErrors: 'Please fix validation errors.',
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
