import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export interface IFrameworkTranslations {
    confirmText: string
}

const defaultTranslations: IFrameworkTranslations = {
    confirmText: 'Confirm',
}

const FrameworkTranslationsContext = createContext<
    [translations: IFrameworkTranslations, setTranslations: Dispatch<SetStateAction<IFrameworkTranslations>>]
>([defaultTranslations, () => alert('Use FrameworkTranslationsProvider')])

export function FrameworkTranslationsProvider(props: { children: ReactNode }) {
    const state = useState<IFrameworkTranslations>(defaultTranslations)
    return <FrameworkTranslationsContext.Provider value={state}>{props.children}</FrameworkTranslationsContext.Provider>
}

export function useFrameworkTranslations() {
    return useContext(FrameworkTranslationsContext)
}
