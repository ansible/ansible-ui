import { ReactNode } from 'react'
import { PageNavigateCallbackContextProvider } from './components/usePageNavigate'
import { PageAlertToasterProvider } from './PageAlertToaster'
import { PageDialogProvider } from './PageDialog'
import { SettingsProvider } from './Settings'
import { FrameworkTranslationsProvider } from './useFrameworkTranslations'

export function PageFramework(props: { children: ReactNode; navigate?: (to: string) => void }) {
  return (
    <PageNavigateCallbackContextProvider callback={props.navigate}>
      <FrameworkTranslationsProvider>
        <PageAlertToasterProvider>
          <PageDialogProvider>
            <SettingsProvider>{props.children}</SettingsProvider>
          </PageDialogProvider>
        </PageAlertToasterProvider>
      </FrameworkTranslationsProvider>
    </PageNavigateCallbackContextProvider>
  )
}
