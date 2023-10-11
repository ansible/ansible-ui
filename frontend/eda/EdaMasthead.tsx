import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { ExternalLinkAltIcon, QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { PageMasthead, usePageNavigate } from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import { postRequest } from '../common/crud/Data';
import { useActiveUser } from '../common/useActiveUser';
import { EdaRoute } from './EdaRoutes';
import { API_PREFIX } from './constants';
import EdaIcon from './eda-logo.svg';

export function EdaMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const pageNavigate = usePageNavigate();
  const activeUser = useActiveUser();
  const { cache } = useSWRConfig();
  const logout = useCallback(async () => {
    await postRequest(`${API_PREFIX}/auth/session/logout/`, {});
    for (const key of cache.keys()) {
      cache.delete(key);
    }
    pageNavigate(EdaRoute.Login);
  }, [cache, pageNavigate]);
  return (
    <PageMasthead
      icon={<EdaIcon style={{ height: 64 }} />}
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
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(EdaRoute.Notifications)} />
        </ToolbarItem> */}
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              icon={<ExternalLinkAltIcon />}
              component="a"
              href="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index"
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
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={<UserCircleIcon />}
            label={activeUser?.username}
          >
            <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() => pageNavigate(EdaRoute.MyPage)}
            >
              {t('User details')}
            </DropdownItem>
            <DropdownItem id="logout" label={t('Logout')} onClick={() => void logout()}>
              {t('Logout')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}
