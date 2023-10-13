import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { PageMasthead, usePageNavigate } from '../framework';
import { PageMastheadDropdown } from '../framework/PageMasthead/PageMastheadDropdown';
import { PageSettingsIcon } from '../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../framework/PageMasthead/PageThemeSwitcher';
import { PageRefreshIcon } from '../frontend/common/PageRefreshIcon';
import { PlatformRoute } from './PlatformRoutes';
import { useActivePlatformUser } from './hooks/useActivePlatformUser';
import PlatformIcon from './platform-icon.svg';

export function PlatformMasthead() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const activeUser = useActivePlatformUser();

  const { cache } = useSWRConfig();
  const logout = useCallback(async () => {
    await fetch('/api/gateway/v1/logout/');
    for (const key of cache.keys()) {
      cache.delete(key);
    }
    pageNavigate(PlatformRoute.Login);
  }, [cache, pageNavigate]);

  return (
    <PageMasthead
      icon={<PlatformIcon style={{ width: 52 }} />}
      title={process.env.PRODUCT}
      brand={process.env.BRAND}
    >
      <ToolbarItem style={{ flexGrow: 1 }} />
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageSettingsIcon />
        </ToolbarItem>
        {/* <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(PlatformRoute.Notifications)} />
        </ToolbarItem> */}
        {/* <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              icon={<ExternalLinkAltIcon />}
              component="a"
              href={`${getDocsBaseUrl(config)}/html/userguide/index.html`}
              target="_blank"
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem>
            <DropdownItem
              id="about"
              onClick={() => openAnsibleAboutModal({})}
              data-cy="masthead-about"
            >
              {t('About')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem> */}
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={<UserCircleIcon />}
            label={activeUser?.username}
          >
            {/* <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() =>
                pageNavigate(PlatformRoute.UserPage, { params: { id: activeUser?.id } })
              }
            /> */}
            <DropdownItem id="logout" label={t('Logout')} onClick={() => void logout()}>
              {t('Logout')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}
