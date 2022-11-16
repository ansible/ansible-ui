import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export interface IFrameworkTranslations {
  cancelText: string
  canceledText: string
  closeText: string
  confirmText: string
  errorText: string
  noItemsFound: string
  ofText: string
  pendingText: string
  processingText: string
  selectedText: string
  submitText: string
  submittingText: string
  successText: string
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
