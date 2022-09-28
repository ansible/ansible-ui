import { ReactNode } from 'react'
import { PageDialogProvider } from './DialogContext'
import { SettingsProvider } from './Settings'
import { FrameworkTranslationsProvider } from './useFrameworkTranslations'

export function PageFrameworkProvider(props: { children: ReactNode }) {
    return (
        <FrameworkTranslationsProvider>
            <SettingsProvider>
                <PageDialogProvider>{props.children}</PageDialogProvider>
            </SettingsProvider>
        </FrameworkTranslationsProvider>
    )
}
