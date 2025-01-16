import { PageMasthead, usePageNavigate } from '@ansible/ansible-ui-framework';
import { PageMastheadDropdown } from '@ansible/ansible-ui-framework/PageMasthead/PageMastheadDropdown';
import { PageThemeSwitcher } from '@ansible/ansible-ui-framework/PageMasthead/PageThemeSwitcher';
import { useAnsibleAboutModal } from '@ansible/common-ui/AboutModal';
import { PageRefreshIcon } from '@ansible/common-ui/PageRefreshIcon';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import EdaBrand from '../../assets/eda-logo.svg?react';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser } from '../common/useEdaActiveUser';
import { EdaRoute } from './EdaRoutes';

export function EdaMasthead() {
  const { t } = useTranslation();
  const openAnsibleAboutModal = useAnsibleAboutModal();
  const pageNavigate = usePageNavigate();
  const { activeEdaUser, refreshActiveEdaUser } = useEdaActiveUser();
  const logout = useCallback(async () => {
    await postRequest(edaAPI`/auth/session/logout/`, {});
    refreshActiveEdaUser?.();
    pageNavigate(EdaRoute.Overview);
  }, [pageNavigate, refreshActiveEdaUser]);
  return (
    <PageMasthead brand={<EdaBrand style={{ height: 48 }} />}>
      <ToolbarGroup variant="icon-button-group" style={{ flexGrow: 1 }}>
        <ToolbarItem style={{ marginLeft: 'auto' }}>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
          <PageThemeSwitcher />
        </ToolbarItem>
        {/* <ToolbarItem>
          <PageNotificationsIcon count={0} onClick={() => pageNavigate(EdaRoute.Notifications)} />
        </ToolbarItem> */}
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              isExternalLink
              component="a"
              href="https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index"
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem>
            <DropdownItem
              id="about"
              onClick={() => openAnsibleAboutModal({ brandImageSrc: '/assets/eda-logo.svg' })}
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
            label={activeEdaUser?.username}
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
