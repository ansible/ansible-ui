import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageMasthead } from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageNotificationsIcon } from '../../framework/PageMasthead/PageNotificationsIcon';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import { postRequest } from '../common/crud/Data';
import { useClearCache } from '../common/useInvalidateCache';
import { hubAPI } from './api/formatPath';
import GalaxyBrand from './galaxy-logo.svg';
import { useHubContext } from './useHubContext';

export function HubMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const { clearAllCache } = useClearCache();
  const navigate = useNavigate();
  const context = useHubContext();
  const logout = useCallback(async () => {
    await postRequest(hubAPI`/_ui/v1/auth/logout/`, {});
    clearAllCache();
    navigate('/login');
  }, [clearAllCache, navigate]);
  return (
    <PageMasthead brand={<GalaxyBrand style={{ height: 48, marginTop: -8 }} />}>
      <ToolbarGroup variant="icon-button-group" style={{ flexGrow: 1 }}>
        <ToolbarItem style={{ marginLeft: 'auto' }}>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageSettingsIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageNotificationsIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            {/* <DropdownItem
              id="documentation"
              icon={<ExternalLinkAltIcon />}
              component="a"
              href={`${getDocsBaseUrl(config)}/html/userguide/index.html`}
              target="_blank"
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem> */}
            <></>
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
            label={context?.user?.username}
          >
            {/* <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() => pageNavigate(HubRoute.UserPage, { params: { id: activeUser?.id } })}
            /> */}
            <></>
            <DropdownItem id="logout" onClick={() => void logout()}>
              {t('Logout')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}
