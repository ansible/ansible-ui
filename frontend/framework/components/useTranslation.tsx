import { Button } from '@patternfly/react-core'
import { createContext, ReactNode, useContext, useState } from 'react'

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

export function useTranslation() {
    const devMode = useContext(TranslationContext)
    if (devMode) {
        return {
            t: (text: string) => text.toUpperCase(),
        }
    }
    return {
        t: (text: string) => text,
    }
}

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
