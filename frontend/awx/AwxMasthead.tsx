import '@patternfly/patternfly/patternfly-base.css';
import '@patternfly/patternfly/patternfly-charts.css';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMasthead, usePageNavigate } from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageNotificationsIcon } from '../../framework/PageMasthead/PageNotificationsIcon';
import { PageSettingsIcon } from '../../framework/PageMasthead/PageSettingsIcon';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import AwxIcon from '../../icons/awx-logo.svg';
import { useAnsibleAboutModal } from '../common/AboutModal';
import { PageRefreshIcon } from '../common/PageRefreshIcon';
import '../common/i18n';
import { useActiveUser } from '../common/useActiveUser';
import { AwxRoute } from './AwxRoutes';
import { useAwxConfig } from './common/useAwxConfig';
import getDocsBaseUrl from './common/util/getDocsBaseUrl';

export function AwxMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const config = useAwxConfig();
  const pageNavigate = usePageNavigate();
  const activeUser = useActiveUser();
  const logout = useCallback(async () => {
    await fetch('/api/logout/');
    pageNavigate(AwxRoute.Login);
  }, [pageNavigate]);
  return (
    <PageMasthead
      icon={<AwxIcon style={{ height: 64 }} />}
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
        <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(AwxRoute.Notifications)} />
        </ToolbarItem>
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
                  open(`${getDocsBaseUrl(config)}/html/userguide/index.html`, '_blank'),
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
                onClick: () => pageNavigate(AwxRoute.UserPage, { params: { id: activeUser?.id } }),
              },
              { id: 'logout', label: t('Logout'), onClick: () => void logout() },
            ]}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </PageMasthead>
  );
}
