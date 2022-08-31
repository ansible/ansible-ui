import { createContext, ReactNode, useContext, useState } from 'react'

export const DialogContext = createContext<[ReactNode | undefined, (dialog?: ReactNode) => void]>([undefined, () => null])

export function useDialog() {
    return useContext(DialogContext)
}

export function DialogProvider(props: { children?: ReactNode }) {
    const [dialog, setDialog] = useState<ReactNode>()
    return (
        <DialogContext.Provider value={[dialog, setDialog]}>
            {dialog !== undefined && dialog}
            {props.children}
        </DialogContext.Provider>
    )
}
