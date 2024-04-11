import './PageFramework.css';

import { ReactNode } from 'react';
import { PageAlertToasterProvider } from './PageAlertToaster';
import { PageDialogProvider } from './PageDialogs/PageDialog';
import { PageNavSideBarProvider } from './PageNavigation/PageNavSidebar';
import { PageNavigationRoutesProvider } from './PageNavigation/PageNavigationRoutesProvider';
import { PageNotificationsProvider } from './PageNotifications/PageNotificationsProvider';
import { PageSettingsProvider } from './PageSettings/PageSettingsProvider';
import { PageBreadcrumbsProvider } from './PageTabs/PageBreadcrumbs';
import { FrameworkTranslationsProvider } from './useFrameworkTranslations';

/**
 * The `PageFramework` component bundles up all the context providers in the Ansible UI framework in a convienent component for framework consumers. Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.
 *
 * @example
 * <PageFramework>...</PageFramework>
 */
export function PageFramework(props: { children: ReactNode; defaultRefreshInterval: number }) {
  return (
    <FrameworkTranslationsProvider>
      <PageSettingsProvider defaultRefreshInterval={props.defaultRefreshInterval}>
        <PageNavigationRoutesProvider>
          <PageDialogProvider>
            <PageAlertToasterProvider>
              <PageNavSideBarProvider>
                <PageNotificationsProvider>
                  <PageBreadcrumbsProvider>{props.children}</PageBreadcrumbsProvider>
                </PageNotificationsProvider>
              </PageNavSideBarProvider>
            </PageAlertToasterProvider>
          </PageDialogProvider>
        </PageNavigationRoutesProvider>
      </PageSettingsProvider>
    </FrameworkTranslationsProvider>
  );
}
