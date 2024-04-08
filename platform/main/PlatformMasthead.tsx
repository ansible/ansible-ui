import {
  Stack,
  TextContent,
  Title,
  ToolbarGroup,
  ToolbarItem,
  Truncate,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
  RedhatIcon,
  UserCircleIcon,
} from '@patternfly/react-icons';
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
import { useClearCache } from '../../frontend/common/useInvalidateCache';
import { useHubNotifications } from '../../frontend/hub/main/HubMasthead';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformAbout } from './PlatformAbout';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { PlatformRoute } from './PlatformRoutes';

export function PlatformMasthead() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  useAwxNotifications();
  useHubNotifications();
  const showTitle = useBreakpoint('md');
  const [_dialog, setDialog] = usePageDialog();
  const { clearAllCache } = useClearCache();
  const { user, refresh } = usePlatformActiveUser();

  const logout = useCallback(async () => {
    try {
      await postRequest(gatewayAPI`/logout/`, {});
    } catch (e) {
      // do nothing
    }
    clearAllCache();

    void refresh?.();
  }, [clearAllCache, refresh]);

  return (
    <PageMasthead
      brand={
        (
          <RedhatIcon
            style={{ height: 36, width: 36, color: '#ee0000', marginTop: -24, marginRight: -4 }}
          />
        ) as unknown as string
      }
    >
      {showTitle && (
        <ToolbarItem style={{ flexGrow: 1 }}>
          <TextContent>
            <Title
              headingLevel="h1"
              size="xl"
              style={{ fontWeight: 'unset', margin: 0, lineHeight: 1.2 }}
            >
              <Stack>
                <Truncate
                  content={t('Red Hat')}
                  className="pf-v5-u-font-weight-bold"
                  style={{ minWidth: 0 }}
                />
                <Truncate
                  content={t('Ansible Automation Platform')}
                  className="pf-v5-u-font-weight-light"
                  style={{ minWidth: 0 }}
                />
              </Stack>
            </Title>
          </TextContent>
        </ToolbarItem>
      )}
      <ToolbarItem style={{ flexGrow: 1 }} />
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <PageRefreshIcon />
        </ToolbarItem>
        <ToolbarItem>
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
          <PageMastheadDropdown id="account-menu" icon={<UserCircleIcon />} label={user?.username}>
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
