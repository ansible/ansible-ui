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
  Truncate,
} from '@patternfly/react-core';
import {
  BarsIcon,
  CogIcon,
  ExternalLinkAltIcon,
  QuestionCircleIcon,
  UserCircleIcon,
} from '@patternfly/react-icons';
import { Children, ReactNode, Suspense, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useBreakpoint } from '../../framework';
import { useSettingsDialog } from '../../framework/Settings';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { AutomationServerType } from '../automation-servers/interfaces/AutomationServerType';
import { swrOptions, useFetcher } from '../Data';
import { RouteObj, RouteType } from '../Routes';
import { useAnsibleAboutModal } from './AboutModal';
import styled from 'styled-components';

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

export function AnsibleMasthead(props: {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  hideLogin?: boolean;
}) {
  const { hideLogin } = props;
  const isSmallOrLarger = useBreakpoint('sm');
  const { t } = useTranslation();
  const openSettings = useSettingsDialog(t);
  const openAnsibleAboutModal = useAnsibleAboutModal();

  const brand: string = process.env.BRAND ?? '';
  const product: string = process.env.PRODUCT ?? t('Ansible');

  return (
    <Masthead display={{ default: 'inline' }}>
      {!hideLogin && (
        <MastheadToggle onClick={() => props.setNavOpen(!props.isNavOpen)}>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
      )}
      {isSmallOrLarger ? (
        <MastheadMain>
          <MastheadBrand>
            <MastheadBrandDiv>
              <img
                src="/brand-logo.svg"
                alt={t('brand logo')}
                height="45"
                style={{ height: '45px' }}
              />
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
                  <Notifications />
                </ToolbarItem>

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
                                                icon={theme === ThemeE.Light ? <SunIcon /> : <div style={{ width: 24 }} />}
                                                onClick={() => setTheme?.(ThemeE.Light)}
                                            >
                                                Light
                                            </DropdownItem>
                                            <DropdownItem
                                                icon={theme === ThemeE.Dark ? <MoonIcon /> : <div style={{ width: 24 }} />}
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
                            'https://docs.ansible.com/automation-controller/4.2.0/html/userguide/index.html',
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

export function isRouteActive(route: RouteType | RouteType[], location: { pathname: string }) {
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

function AccountDropdownInternal() {
  const isSmallOrLarger = useBreakpoint('sm');
  const fetcher = useFetcher();
  const { automationServer } = useAutomationServers();
  const meResponse = useSWR<{ results: { username: string }[] }>(
    automationServer
      ? automationServer.type !== AutomationServerType.EDA
        ? '/api/v2/me/'
        : undefined
      : undefined,
    fetcher,
    swrOptions
  );
  const history = useNavigate();
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const onToggle = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const { t } = useTranslation();
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
            {isSmallOrLarger && (
              <FlexItem wrap="nowrap">{meResponse.data?.results?.[0]?.username}</FlexItem>
            )}
          </Flex>
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="user-details"
          onClick={() => {
            history(RouteObj.Users);
          }}
        >
          {t('User details')}
        </DropdownItem>,
        <DropdownItem
          key="logout"
          onClick={() => {
            async function logout() {
              await fetch(
                automationServer && automationServer.type === AutomationServerType.EDA
                  ? '/api/eda/v1/auth/logout/?next=/'
                  : '/api/logout/'
              );
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
