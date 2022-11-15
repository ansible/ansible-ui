import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export interface IFrameworkTranslations {
  cancelText: string
  closeText: string
  confirmText: string
  errorText: string
  noItemsFound: string
  pendingText: string
  processingText: string
  selectedText: string
  submitText: string
  submittingText: string
  successText: string
  ofText: string
}

const defaultTranslations: IFrameworkTranslations = {
  cancelText: 'Cancel',
  closeText: 'Close',
  confirmText: 'Confirm',
  errorText: 'Error',
  noItemsFound: 'No items found',
  pendingText: 'Pending',
  processingText: 'Processing',
  submitText: 'Submit',
  submittingText: 'Submitting',
  successText: 'Success',
  selectedText: 'Selected',
  ofText: 'of',
}

const FrameworkTranslationsContext = createContext<
  [
    translations: IFrameworkTranslations,
    setTranslations: Dispatch<SetStateAction<IFrameworkTranslations>>
  ]
>([defaultTranslations, () => alert('Use FrameworkTranslationsProvider')])

export function FrameworkTranslationsProvider(props: { children: ReactNode }) {
  const state = useState<IFrameworkTranslations>(defaultTranslations)
  return (
    <FrameworkTranslationsContext.Provider value={state}>
      {props.children}
    </FrameworkTranslationsContext.Provider>
  )
}

export function useFrameworkTranslations() {
  return useContext(FrameworkTranslationsContext)
}
