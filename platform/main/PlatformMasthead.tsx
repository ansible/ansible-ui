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
import { useEdaActiveUser } from '@ansible/eda-ui/common/useEdaActiveUser';
import { useHubActiveUser } from '@ansible/hub-ui/common/useHubActiveUser';
import { useHubNotifications } from '@ansible/hub-ui/main/HubMasthead';
import { DropdownItem, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AAPLogo from '../assets/aap-logo.svg?react';
import RedHatIcon from '../assets/redhat-icon.svg?react';
import { useQuickStarts } from '../overview/quickstarts/useQuickStarts';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useIsManagedCloudInstall } from './GatewayUIAuth';
import { useLegacyAuth } from './LegacyAuthProvider';
import { PlatformAbout } from './PlatformAbout';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformMasthead() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  useAwxNotifications();
  useHubNotifications();
  const isSmOrLarger = useBreakpoint('sm');
  const [_dialog, setDialog] = usePageDialog();
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  const { refreshActiveAwxUser } = useAwxActiveUser();
  const { refreshActiveEdaUser } = useEdaActiveUser();
  const { refreshActiveHubUser } = useHubActiveUser();
  const { refreshLegacyAuth } = useLegacyAuth();
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
    void refreshLegacyAuth?.();

    pageNavigate(PlatformRoute.Overview);
  }, [
    pageNavigate,
    refreshActiveEdaUser,
    refreshActiveAwxUser,
    refreshActiveHubUser,
    refreshActivePlatformUser,
    refreshLegacyAuth,
  ]);

  return (
    <PageMasthead
      brand={
        <AAPLogo
          style={{ height: 48, textDecoration: 'none', color: 'var(--pf-v5-global--Color--100)' }}
        />
      }
    >
      <ToolbarItem style={{ flexGrow: 1 }}>
        {!isSmOrLarger && <RedHatIcon style={{ height: 38, width: 38 }} />}
      </ToolbarItem>
      <ToolbarGroup
        variant="action-group-plain"
        // This fixes displaying the toolbar items on the right side of the masthead
        // on small screens with the AAP logo
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
            >
              {t('Documentation')}
            </DropdownItem>
            {!managedCloudInstall && quickStarts.length > 0 ? (
              <DropdownItem
                id="about"
                onClick={() => pageNavigate(PlatformRoute.QuickStarts)}
                data-cy="masthead-quickstarts"
              >
                {t('Quick starts')}
              </DropdownItem>
            ) : null}
            <DropdownItem
              id="about"
              onClick={() => setDialog(<PlatformAbout />)}
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
