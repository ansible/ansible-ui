import './PageFramework.css';

import { ReactNode } from 'react';
import { RefreshIntervalProvider } from '../frontend/common/components/RefreshInterval';
import { PageAlertToasterProvider } from './PageAlertToaster';
import { PageDialogProvider } from './PageDialogs/PageDialog';
import { PageNavSideBarProvider } from './PageNavigation/PageNavSidebar';
import { PageNotificationsProvider } from './PageNotifications/PageNotificationsProvider';
import { PageBreadcrumbsProvider } from './PageTabs/PageBreadcrumbs';
import { SettingsProvider } from './Settings';
import { FrameworkTranslationsProvider } from './useFrameworkTranslations';

/**
 * The `PageFramework` component bundles up all the context providers in the Ansible UI framework in a convienent component for framework consumers. Examples of internal context providers are translations, navigation, settings, alerts, and dialogs.
 *
 * @example
 * <PageFramework>...</PageFramework>
 */
export function PageFramework(props: { children: ReactNode; defaultRefreshInterval?: number }) {
  return (
    <FrameworkTranslationsProvider>
      <SettingsProvider>
        <RefreshIntervalProvider default={props.defaultRefreshInterval}>
          <PageDialogProvider>
            <PageAlertToasterProvider>
              <PageNavSideBarProvider>
                <PageNotificationsProvider>
                  <PageBreadcrumbsProvider>{props.children}</PageBreadcrumbsProvider>
                </PageNotificationsProvider>
              </PageNavSideBarProvider>
            </PageAlertToasterProvider>
          </PageDialogProvider>
        </RefreshIntervalProvider>
      </SettingsProvider>
    </FrameworkTranslationsProvider>
  );
}
