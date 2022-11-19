import { ReactNode } from 'react'
import { PageNavigateCallbackContextProvider } from './components/usePageNavigate'
import { PageAlertToasterProvider } from './PageAlertToaster'
import { PageDialogProvider } from './PageDialog'
import { SettingsProvider } from './Settings'
import { FrameworkTranslationsProvider } from './useFrameworkTranslations'

/**
 * The `PageFramework` component bundles up all the context providers in the Ansible UI framework in a convienent component for framework consumers. Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.
 *
 * @example
 * <PageFramework navigate={navigate}>...</PageFramework>
 */
export function PageFramework(props: { children: ReactNode; navigate?: (to: string) => void }) {
  return (
    <FrameworkTranslationsProvider>
      <SettingsProvider>
        <PageDialogProvider>
          <PageAlertToasterProvider>
            <PageNavigateCallbackContextProvider callback={props.navigate}>
              {props.children}
            </PageNavigateCallbackContextProvider>
          </PageAlertToasterProvider>
        </PageDialogProvider>
      </SettingsProvider>
    </FrameworkTranslationsProvider>
  )
}
