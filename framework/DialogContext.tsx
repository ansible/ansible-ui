import { createContext, ReactNode, useContext, useState } from 'react'

export const DialogContext = createContext<ReactNode | undefined>(undefined)
export const SetDialogContext = createContext<(dialog?: ReactNode) => void>(() => null)

export function useDialog() {
    return useContext(DialogContext)
}

export function useSetDialog() {
    return useContext(SetDialogContext)
}

export function DialogProvider(props: { children?: ReactNode }) {
    const [dialog, setDialog] = useState<ReactNode>()
    return (
        <SetDialogContext.Provider value={setDialog}>
            <DialogContext.Provider value={dialog}>
                {dialog !== undefined && dialog}
                {props.children}
            </DialogContext.Provider>
        </SetDialogContext.Provider>
    )
}
