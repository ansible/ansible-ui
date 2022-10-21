import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export interface IFrameworkTranslations {
    errorText: string
    cancelText: string
    closeText: string
    confirmText: string
    pendingText: string
    submitText: string
    submittingText: string
    successText: string
    processingText: string
    noItemsFound: string
}

const defaultTranslations: IFrameworkTranslations = {
    errorText: 'Error',
    cancelText: 'Cancel',
    closeText: 'Close',
    confirmText: 'Confirm',
    pendingText: 'Pending',
    submitText: 'Submit',
    submittingText: 'Submitting',
    successText: 'Success',
    processingText: 'Processing',
    noItemsFound: 'No items found',
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
