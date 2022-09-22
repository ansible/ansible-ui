/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@patternfly/react-core'
import { createContext, ReactNode, useContext, useState } from 'react'
export * from 'react-i18next'

const TranslationContext = createContext(false)
const SetTranslationContext = createContext<(dev: boolean) => void>(() => {
    /**/
})

export function TranslationProvider(props: { children: ReactNode }) {
    const [theme, setTranslation] = useState(false)
    return (
        <TranslationContext.Provider value={theme}>
            <SetTranslationContext.Provider value={setTranslation}>{props.children}</SetTranslationContext.Provider>
        </TranslationContext.Provider>
    )
}

// export function useTranslation() {
//     const devMode = useContext(TranslationContext)
//     if (devMode) {
//         return {
//             t: (text: string, options?: { count?: number }) => text.toUpperCase(),
//         }
//     }
//     return {
//         t: (text: string, options?: { count?: number }) => {
//             if (options?.count !== undefined) {
//                 text = text.replace('{{count}}', options.count.toString())
//             }
//             return text
//         },
//     }
// }

export function TranslationSwitcher() {
    const devMode = useContext(TranslationContext)
    const setDevMode = useContext(SetTranslationContext)
    const toggleTheme = () => setDevMode(!devMode)
    return (
        <Button onClick={toggleTheme} variant="plain">
            {devMode ? 'AA' : 'Aa'}
        </Button>
    )
}
