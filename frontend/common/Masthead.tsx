import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Flex,
  FlexItem,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  NotificationBadge,
  PageToggleButton,
  Spinner,
  Title,
  TitleSizes,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  Truncate,
} from '@patternfly/react-core';
import {
  BarsIcon,
  CogIcon,
  ExternalLinkAltIcon,
  QuestionCircleIcon,
  RedoAltIcon,
  UserCircleIcon,
} from '@patternfly/react-icons';
import { Children, ReactNode, Suspense, useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';
import { useBreakpoint } from '../../framework';
import { usePageNavSideBar } from '../../framework/PageNav/PageNavSidebar';
import { useSettingsDialog } from '../../framework/Settings';
import { RouteObj } from '../Routes';
import AwxIcon from '../assets/AWX.svg';
import EdaIcon from '../assets/EDA.svg';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { useAwxConfig } from '../awx/common/useAwxConfig';
import getDocsBaseUrl from '../awx/common/util/getDocsBaseUrl';
import { API_PREFIX } from '../eda/constants';
import { useAnsibleAboutModal } from './AboutModal';
import { swrOptions, useFetcher } from './crud/Data';
import { postRequest } from './crud/usePostRequest';
import { shouldShowAutmationServers } from './should-show-autmation-servers';
import { useActiveUser } from './useActiveUser';

const MastheadBrandDiv = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;
const IconDiv = styled.div`
  color: white;
  text-decoration: none;
  display: flex;
  flex-direction: column;
`;

const TruncateContentSpan = styled.span`
  font-weight: 900;
  margin-top: -4px;
`;

const ToolbarSpan = styled.span`
  flex-grow: 1;
`;
// commented because variables are currectly unused
// const IconGroupDiv = styled.div`
//   width: 24px;
// `;

function isEdaServer(
  server: { type: AutomationServerType; name: string; url: string } | undefined
): boolean {
  return (server?.type && server.type === AutomationServerType.EDA) || process.env.EDA === 'true';
}

export function AnsibleMasthead(props: { hideLogin?: boolean }) {
  const { hideLogin } = props;
  const isSmallOrLarger = useBreakpoint('sm');
  const { t } = useTranslation();
  const openSettings = useSettingsDialog(t);
  const openAnsibleAboutModal = useAnsibleAboutModal();

  const brand: string = process.env.BRAND ?? '';
  const product: string = process.env.PRODUCT ?? t('Ansible');
  const { automationServer } = useAutomationServers();
  const config = useAwxConfig();
  const navBar = usePageNavSideBar();

  return (
    <Masthead display={{ default: 'inline' }}>
      {!hideLogin && (
        <MastheadToggle onClick={() => navBar.setState({ isOpen: !navBar.isOpen })}>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
      )}
      {isSmallOrLarger ? (
        <MastheadMain>
          <MastheadBrand>
            <MastheadBrandDiv>
              {shouldShowAutmationServers().showAutomationServers ? (
                <>
                  {automationServer?.type === AutomationServerType.EDA && <EdaIcon />}
                  {automationServer?.type === AutomationServerType.AWX && <AwxIcon />}
                </>
              ) : (
                <img
                  src="/static/media/brand-logo.svg"
                  alt={t('brand logo')}
                  height="45"
                  style={{ height: '45px' }}
                />
              )}
              <IconDiv>
                {brand && (
                  <TruncateContentSpan>
                    <Truncate content={brand} style={{ minWidth: 0 }} />
                  </TruncateContentSpan>
                )}
                <Title
                  headingLevel="h1"
                  sizes={TitleSizes[TitleSizes.lg]}
                  style={{ lineHeight: 1 }}
                >
                  <Truncate content={product} style={{ minWidth: 0 }} />
                </Title>
              </IconDiv>
            </MastheadBrandDiv>
          </MastheadBrand>
        </MastheadMain>
      ) : (
        <MastheadMain style={{ marginRight: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
          <MastheadBrand>
            <Title headingLevel="h1" sizes={TitleSizes[TitleSizes.md]} style={{ color: 'white' }}>
              <Truncate content={product} style={{ minWidth: 0, marginLeft: -8 }} />
            </Title>
          </MastheadBrand>
        </MastheadMain>
      )}
      {!hideLogin && (
        <MastheadContent style={{ marginLeft: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
          <ToolbarSpan />
          {/* <Toolbar id="toolbar" isFullHeight isStatic> */}
          <Toolbar id="toolbar" style={{ padding: 0 }}>
            <ToolbarContent>
              <ToolbarGroup
                variant="icon-button-group"
                alignment={{ default: 'alignRight' }}
                spacer={{ default: 'spacerNone', md: 'spacerMd' }}
              >
                {/* {process.env.NODE_ENV === 'development' && windowSize !== 'xs' && (
                                <ToolbarItem style={{ paddingRight: 8 }}>{windowSize.toUpperCase()}</ToolbarItem>
                            )} */}
                <ToolbarItem>
                  <Refresh />
                </ToolbarItem>
                {!isEdaServer(automationServer) && (
                  <ToolbarItem>
                    <Notifications />
                  </ToolbarItem>
                )}

                {/* <ToolbarItem>
                  <ApplicationLauncherBasic />
                </ToolbarItem> */}

                <ToolbarGroup
                  variant="icon-button-group"
                  visibility={{ default: 'hidden', lg: 'visible' }}
                >
                  {/* <ToolbarItem>
                                    <AppBarDropdown icon={<CogIcon />}>
                                        <DropdownGroup label="Theme">
                                            <DropdownItem
                                                icon={theme === ThemeE.Light ? <SunIcon /> : <IconGroupDiv />}
                                                onClick={() => setTheme?.(ThemeE.Light)}
                                            >
                                                Light
                                            </DropdownItem>
                                            <DropdownItem
                                                icon={theme === ThemeE.Dark ? <MoonIcon /> : <IconGroupDiv />}
                                                onClick={() => setTheme?.(ThemeE.Dark)}
                                            >
                                                Dark
                                            </DropdownItem>
                                        </DropdownGroup>
                                    </AppBarDropdown>
                                </ToolbarItem> */}
                  <ToolbarItem>
                    <Button
                      icon={<CogIcon />}
                      variant={ButtonVariant.plain}
                      onClick={openSettings}
                    />
                  </ToolbarItem>
                  <ToolbarItem>
                    <AppBarDropdown icon={<QuestionCircleIcon />}>
                      <DropdownItem
                        onClick={() => {
                          open(
                            isEdaServer(automationServer)
                              ? 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index'
                              : `${getDocsBaseUrl(config)}/html/userguide/index.html`,
                            '_blank'
                          );
                        }}
                        icon={<ExternalLinkAltIcon />}
                      >
                        {t('Documentation')}
                      </DropdownItem>
                      <DropdownItem onClick={() => openAnsibleAboutModal({})}>
                        {t('About')}
                      </DropdownItem>
                    </AppBarDropdown>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarGroup>
              <ToolbarItem>
                <AccountDropdown />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      )}
    </Masthead>
  );
}

export function isRouteActive(route: string | string[], location: { pathname: string }) {
  if (Array.isArray(route)) {
    for (const r of route) {
      if (location.pathname.startsWith(r)) return true;
    }
    return false;
  }
  return location.pathname.includes(route);
}

function AppBarDropdown(props: { icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const onToggle = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <DropdownToggle toggleIndicator={null} onToggle={onToggle}>
          {props.icon}
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={open ? Children.toArray(props.children) : undefined}
      position="right"
    />
  );
}

function AccountDropdown() {
  return (
    <Suspense
      fallback={
        <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <Spinner size="lg" />
          </FlexItem>
        </Flex>
      }
    >
      <AccountDropdownInternal />
    </Suspense>
  );
}

export function EdaUserInfo() {
  const fetcher = useFetcher();
  const meResponse = useSWR<{ id: number; username: string }>(
    `${API_PREFIX}/users/me/`,
    fetcher,
    swrOptions
  );
  return meResponse?.data;
}

function UserInfo() {
  const { automationServer } = useAutomationServers();
  const fetcher = useFetcher();
  const meResponse = useSWR<{ results: { username: string }[] }>(
    automationServer ? '/api/v2/me/' : undefined,
    fetcher,
    swrOptions
  );
  return meResponse.data?.results?.[0];
}

function AccountDropdownInternal() {
  const isSmallOrLarger = useBreakpoint('sm');
  const { automationServer } = useAutomationServers();
  const edaActiveUser = isEdaServer(automationServer) ? EdaUserInfo() : undefined;
  const userInfo = isEdaServer(automationServer) ? edaActiveUser : UserInfo();
  const history = useNavigate();
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const onToggle = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const { t } = useTranslation();
  const activeUser = useActiveUser();
  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          toggleIndicator={null}
          onToggle={onToggle}
          style={{ paddingRight: 0, paddingLeft: 8 }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
            <FlexItem>
              <UserCircleIcon size="md" />
            </FlexItem>
            {isSmallOrLarger && <FlexItem wrap="nowrap">{userInfo?.username}</FlexItem>}
          </Flex>
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="user-details"
          onClick={() => {
            isEdaServer(automationServer)
              ? history(
                  edaActiveUser
                    ? RouteObj.EdaUserDetails.replace(':id', `${edaActiveUser?.id || ''}`)
                    : RouteObj.EdaUsers
                )
              : history(
                  activeUser
                    ? RouteObj.UserDetails.replace(':id', activeUser.id.toString())
                    : RouteObj.Users
                );
          }}
        >
          {t('User details')}
        </DropdownItem>,
        <DropdownItem
          key="logout"
          onClick={() => {
            async function logout() {
              isEdaServer(automationServer)
                ? await postRequest(`${API_PREFIX}/auth/session/logout/`, {})
                : await fetch('/api/logout/');
              history('/');
            }
            void logout();
          }}
        >
          {t('Logout')}
        </DropdownItem>,
      ]}
      position="right"
      // style={{ marginTop: 4 }}
    />
  );
}

function Notifications() {
  return (
    <Suspense fallback={<></>}>
      <NotificationsInternal />
    </Suspense>
  );
}

function NotificationsInternal() {
  // const workflowApprovals = useWorkflowApprovals()
  const workflowApprovals = [];
  // const history = useNavigate()
  return (
    <NotificationBadge
      variant={workflowApprovals.length === 0 ? 'read' : 'unread'}
      count={workflowApprovals.length}
      style={{ marginRight: workflowApprovals.length === 0 ? undefined : 12 }}
      // onClick={() => history(RouteObj.WorkflowApprovals)}
    />
  );
}

export function Refresh() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => {
    setRefreshing(true);
    void mutate((key) => typeof key === 'string').finally(() => {
      setRefreshing(false);
    });
  }, []);
  const [rotation, setRotation] = useState(0);

  useLayoutEffect(() => {
    let frame: number;
    let start: number;
    function rotate(timestamp: number) {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      start = timestamp;
      frame = requestAnimationFrame(rotate);
      setRotation((rotate) => rotate + elapsed / 3);
    }
    function stop(timestamp: number) {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;
      start = timestamp;

      frame = requestAnimationFrame(stop);
      setRotation((rotate) => {
        if (Math.floor(rotate / 360) !== Math.floor((rotate + elapsed / 3) / 360)) {
          cancelAnimationFrame(frame);
          return 0;
        }
        return rotate + elapsed / 3;
      });
    }

    if (refreshing) {
      frame = requestAnimationFrame(rotate);
      return () => cancelAnimationFrame(frame);
    } else {
      frame = requestAnimationFrame(stop);
      return () => cancelAnimationFrame(frame);
    }
  }, [refreshing]);

  return (
    <Tooltip content="Refresh" position="bottom" entryDelay={1000}>
      <Button id="refresh" onClick={refresh} variant="plain">
        <RedoAltIcon style={{ transform: `rotateZ(${rotation}deg)` }} />
      </Button>
    </Tooltip>
  );
}
