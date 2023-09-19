import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMasthead, usePageNavigate } from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import EdaIcon from '../../icons/eda-logo.svg';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import { postRequest } from '../common/crud/Data';
import '../common/i18n';
import { useActiveUser } from '../common/useActiveUser';
import { EdaRoute } from './EdaRoutes';
import { API_PREFIX } from './constants';

export function EdaMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const pageNavigate = usePageNavigate();
  const activeUser = useActiveUser();
  const logout = useCallback(async () => {
    await postRequest(`${API_PREFIX}/auth/session/logout/`, {});
    pageNavigate(EdaRoute.Login);
  }, [pageNavigate]);
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
          <PageMastheadDropdown
            id="help-menu"
            icon={<QuestionCircleIcon />}
            items={[
              {
                id: 'documentation',
                icon: <ExternalLinkAltIcon />,
                label: t('Documentation'),
                onClick: () =>
                  open(
                    'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index',
                    '_blank'
                  ),
              },
              {
                id: 'about',
                label: t('About'),
                onClick: () => openAnsibleAboutModal({}),
              },
            ]}
          />
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={<UserCircleIcon size="md" />}
            label={activeUser?.username}
            items={[
              {
                id: 'user-details',
                label: t('User details'),
                onClick: () => pageNavigate(EdaRoute.MyPage),
              },
              { id: 'logout', label: t('Logout'), onClick: () => void logout() },
            ]}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}
