import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

export const DialogContext = createContext<ReactNode | undefined>(undefined)
export const SetDialogContext = createContext<(dialog?: ReactNode) => void>(() => null)

const PageDialogContext = createContext<[dialog: ReactNode | undefined, setDialog: Dispatch<SetStateAction<ReactNode | undefined>>]>([
    undefined,
    () => alert('Use PageDialogProvider'),
])

export function PageDialogProvider(props: { children: ReactNode }) {
    const state = useState<ReactNode | undefined>()
    return <PageDialogContext.Provider value={state}>{props.children}</PageDialogContext.Provider>
}

export function usePageDialog(): [dialog: ReactNode | undefined, setDialog: Dispatch<SetStateAction<ReactNode | undefined>>] {
    return useContext(PageDialogContext)
}
