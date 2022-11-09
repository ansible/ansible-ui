import { ReactNode } from 'react'
import { PageAlertToasterProvider } from './PageAlertToaster'
import { PageDialogProvider } from './PageDialog'
import { SettingsProvider } from './Settings'
import { FrameworkTranslationsProvider } from './useFrameworkTranslations'

export function PageFrameworkProvider(props: { children: ReactNode }) {
  return (
    <FrameworkTranslationsProvider>
      <SettingsProvider>
        <PageDialogProvider>
          <PageAlertToasterProvider>{props.children}</PageAlertToasterProvider>
        </PageDialogProvider>
      </SettingsProvider>
    </FrameworkTranslationsProvider>
  )
}
