import './PageFramework.css';

import { ReactNode } from 'react';
import { PageAlertToasterProvider } from './PageAlertToaster';
import { PageDialogProvider } from './PageDialogs/PageDialog';
import { PageNavSideBarProvider } from './PageNavigation/PageNavSidebar';
import { SettingsProvider } from './Settings';
import { FrameworkTranslationsProvider } from './useFrameworkTranslations';

/**
 * The `PageFramework` component bundles up all the context providers in the Ansible UI framework in a convienent component for framework consumers. Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.
 *
 * @example
 * <PageFramework>...</PageFramework>
 */
export function PageFramework(props: { children: ReactNode }) {
  return (
    <FrameworkTranslationsProvider>
      <SettingsProvider>
        <PageDialogProvider>
          <PageAlertToasterProvider>
            <PageNavSideBarProvider>{props.children}</PageNavSideBarProvider>
          </PageAlertToasterProvider>
        </PageDialogProvider>
      </SettingsProvider>
    </FrameworkTranslationsProvider>
  );
}
