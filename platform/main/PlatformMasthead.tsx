import {
  PageMasthead,
  PageNotificationsIcon,
  useBreakpoint,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageMastheadDropdown } from '@ansible/ansible-ui-framework/PageMasthead/PageMastheadDropdown';
import { PageThemeSwitcher } from '@ansible/ansible-ui-framework/PageMasthead/PageThemeSwitcher';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { useAwxNotifications } from '@ansible/awx-ui/main/AwxMasthead';
import { ChatbotToolbarItem } from '@ansible/chatbot/ChatbotToolbarItem';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { PageRefreshIcon } from '@ansible/common-ui/PageRefreshIcon';
import { useDocsVersion } from '@ansible/common-ui/utils/useDocsVersion';
import { useEdaActiveUser } from '@ansible/eda-ui/common/useEdaActiveUser';
import { useHubActiveUser } from '@ansible/hub-ui/common/useHubActiveUser';
import { useHubNotifications } from '@ansible/hub-ui/main/HubMasthead';
import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformLogo from '../assets/platform-logo.svg?react';
import PlatformIcon from '../assets/platform-icon.svg?react';
import { useRssNotifications } from '../notifications/useRssNotifications';
import { useQuickStarts } from '../overview/quickstarts/useQuickStarts';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useIsManagedCloudInstall } from './GatewayUIAuth';
import { PlatformAbout } from './PlatformAbout';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformMasthead() {
  const { t } = useTranslation();
  const { version: platformVersion } = useDocsVersion();
  const pageNavigate = usePageNavigate();
  useAwxNotifications();
  useHubNotifications();
  useRssNotifications();
  const isSmOrLarger = useBreakpoint('sm');
  const [_dialog, setDialog] = usePageDialog();
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  const { refreshActiveAwxUser } = useAwxActiveUser();
  const { refreshActiveEdaUser } = useEdaActiveUser();
  const { refreshActiveHubUser } = useHubActiveUser();
  const managedCloudInstall = useIsManagedCloudInstall() ?? false;
  const quickStarts = useQuickStarts();

  const logout = useCallback(async () => {
    try {
      await postRequest(gatewayAPI`/logout/`, {});
    } catch {
      // do nothing
    }
    void refreshActiveAwxUser?.();
    void refreshActiveEdaUser?.();
    void refreshActiveHubUser?.();
    void refreshActivePlatformUser?.();

    pageNavigate(PlatformRoute.Login);
  }, [
    pageNavigate,
    refreshActiveEdaUser,
    refreshActiveAwxUser,
    refreshActiveHubUser,
    refreshActivePlatformUser,
  ]);

  return (
    <PageMasthead
      brand={
        <div style={{ marginTop: -6 }}>
          <PlatformLogo style={{ height: 48 }} />
        </div>
      }
    >
      <ToolbarItem style={{ flexGrow: 1 }}>
        {!isSmOrLarger && <PlatformIcon style={{ height: 38, width: 38 }} />}
      </ToolbarItem>
      <ToolbarGroup
        variant="action-group-plain"
        // This fixes displaying the toolbar items on the right side of the masthead
        // on small screens with the platform logo
        style={{ marginLeft: -24 }}
      >
        <ToolbarItem>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem visibility={{ default: 'hidden', lg: 'visible' }}>
          <PageThemeSwitcher />
        </ToolbarItem>
        <ToolbarItem>
          <PageNotificationsIcon />
        </ToolbarItem>
        <ChatbotToolbarItem />
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              isExternalLink
              component="a"
              to={`https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform`}
              data-cy="masthead-documentation"
              data-testid="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem>
            {!managedCloudInstall && quickStarts.length > 0 ? (
              <DropdownItem
                id="quickstarts"
                onClick={() => pageNavigate(PlatformRoute.QuickStarts)}
                data-cy="masthead-quickstarts"
                data-testid="masthead-quickstarts"
              >
                {t('Quick starts')}
              </DropdownItem>
            ) : null}
            <DropdownItem
              id="about"
              onClick={() => setDialog(<PlatformAbout platformVersion={platformVersion} />)}
              data-cy="masthead-about"
              data-testid="masthead-about"
            >
              {t('About')}
            </DropdownItem>
          </PageMastheadDropdown>
        </ToolbarItem>
        <ToolbarItem>
          <PageMastheadDropdown
            id="account-menu"
            icon={<UserCircleIcon />}
            label={activePlatformUser?.username}
          >
            <DropdownItem
              id="user-details"
              label={t('User details')}
              onClick={() =>
                pageNavigate(PlatformRoute.UserPage, { params: { id: activePlatformUser?.id } })
              }
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
