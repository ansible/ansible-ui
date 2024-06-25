import { ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { ExternalLinkAltIcon, QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageMasthead,
  PageNotificationsIcon,
  useBreakpoint,
  usePageDialog,
  usePageNavigate,
} from '../../framework';
import { PageMastheadDropdown } from '../../framework/PageMasthead/PageMastheadDropdown';
import { PageThemeSwitcher } from '../../framework/PageMasthead/PageThemeSwitcher';
import { useAwxNotifications } from '../../frontend/awx/main/AwxMasthead';
import { PageRefreshIcon } from '../../frontend/common/PageRefreshIcon';
import { postRequest } from '../../frontend/common/crud/Data';
import { useHubNotifications } from '../../frontend/hub/main/HubMasthead';
import { gatewayAPI } from '../api/gateway-api-utils';
import AAPLogo from '../icons/aap-logo.svg';
import RedHatIcon from '../icons/redhat-icon.svg';
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

  const logout = useCallback(async () => {
    try {
      await postRequest(gatewayAPI`/logout/`, {});
    } catch (e) {
      // do nothing
    }
    void refreshActivePlatformUser?.();
  }, [refreshActivePlatformUser]);

  return (
    <PageMasthead brand={<AAPLogo style={{ height: 48 }} />}>
      <ToolbarItem style={{ flexGrow: 1 }}>
        {!isSmOrLarger && <RedHatIcon style={{ height: 38, width: 38 }} />}
      </ToolbarItem>
      <ToolbarGroup
        variant="icon-button-group"
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
        <ToolbarItem>
          <PageMastheadDropdown id="help-menu" icon={<QuestionCircleIcon />}>
            <DropdownItem
              id="documentation"
              icon={<ExternalLinkAltIcon />}
              component="a"
              href={`https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform`}
              target="_blank"
              data-cy="masthead-documentation"
            >
              {t('Documentation')}
            </DropdownItem>
            <DropdownItem
              id="about"
              onClick={() => pageNavigate(PlatformRoute.QuickStarts)}
              data-cy="masthead-quickstarts"
            >
              {t('Quickstarts')}
            </DropdownItem>
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
