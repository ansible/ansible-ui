import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMasthead, usePageNavigate } from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageNotificationsIcon } from '../../framework/PageMasthead/PageNotificationsIcon';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import { postRequest } from '../common/crud/Data';
import { useActiveUser } from '../common/useActiveUser';
import { HubRoute } from './HubRoutes';
import { hubAPI } from './api/utils';
import Logo from './galaxy-logo.svg';

export function HubMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const pageNavigate = usePageNavigate();
  const activeUser = useActiveUser();
  const logout = useCallback(async () => {
    await postRequest(hubAPI`/_ui/v1/auth/logout/`, {});
    pageNavigate(HubRoute.Login);
  }, [pageNavigate]);
  return (
    <PageMasthead
      icon={<Logo style={{ height: 48, marginTop: -8 }} />}
      // title={process.env.PRODUCT}
      title=""
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
        <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(HubRoute.Approvals)} />
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
            icon={<UserCircleIcon size="md" />}
            label={activeUser?.username}
          >
            {/* <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() => pageNavigate(HubRoute.UserPage, { params: { id: activeUser?.id } })}
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
