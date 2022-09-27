import { ReactNode } from 'react'
import { SettingsProvider } from './Settings'
import { FrameworkTranslationsProvider } from './useFrameworkTranslations'

export function PageFrameworkProvider(props: { children: ReactNode }) {
    return (
        <SettingsProvider>
            <FrameworkTranslationsProvider>{props.children}</FrameworkTranslationsProvider>
        </SettingsProvider>
    )
}
