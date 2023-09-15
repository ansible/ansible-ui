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
import { mutate } from 'swr';
import { useBreakpoint, usePageNavSideBar, useSettingsDialog } from '../../framework';
import { useAwxConfig } from '../awx/common/useAwxConfig';
import getDocsBaseUrl from '../awx/common/util/getDocsBaseUrl';
import { API_PREFIX } from '../eda/constants';
import { useAnsibleAboutModal } from './AboutModal';
import { RouteObj } from './Routes';
import { postRequest } from './crud/Data';
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

function isEdaServer(): boolean {
  return process.env.UI_MODE === 'EDA';
}

export function AnsibleMasthead(props: { hideLogin?: boolean }) {
  const { hideLogin } = props;
  const isSmallOrLarger = useBreakpoint('sm');
  const { t } = useTranslation();
  const openSettings = useSettingsDialog(t);
  const openAnsibleAboutModal = useAnsibleAboutModal();

  const brand: string = process.env.BRAND ?? '';
  const product: string = process.env.PRODUCT ?? t('Ansible');
  const config = useAwxConfig();
  const navBar = usePageNavSideBar();

  return (
    <Masthead display={{ default: 'inline' }}>
      {!hideLogin && (
        <MastheadToggle onClick={() => navBar.setState({ isOpen: !navBar.isOpen })}>
          <PageToggleButton
            variant="plain"
            aria-label="Global navigation"
            ouiaId="nav-toggle"
            data-cy="nav-toggle"
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
      )}
      {isSmallOrLarger ? (
        <MastheadMain>
          <MastheadBrand>
            <MastheadBrandDiv>
              <img
                src="/static/media/brand-logo.svg"
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
      {hideLogin ? (
        <MastheadContent style={{ marginLeft: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
          {/* <Toolbar id="toolbar" isFullHeight isStatic> */}
          <Toolbar id="toolbar" style={{ padding: 0 }}>
            <ToolbarContent>
              <ToolbarSpan />
              <ToolbarItem>
                <Button
                  icon={<CogIcon />}
                  variant={ButtonVariant.plain}
                  onClick={openSettings}
                  data-cy="settings"
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      ) : (
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
                {!isEdaServer() && (
                  <ToolbarItem>
                    <Notifications />
                  </ToolbarItem>
                )}
                <ToolbarGroup
                  variant="icon-button-group"
                  visibility={{ default: 'hidden', lg: 'visible' }}
                >
                  <ToolbarItem>
                    <Button
                      id="settings"
                      icon={<CogIcon />}
                      variant={ButtonVariant.plain}
                      onClick={openSettings}
                      ouiaId="settings"
                      data-cy="settings"
                    />
                  </ToolbarItem>
                  <ToolbarItem>
                    <AppBarDropdown icon={<QuestionCircleIcon />} id="help">
                      <DropdownItem
                        onClick={() => {
                          open(
                            isEdaServer()
                              ? 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.4/html/eda-getting-started-guide/index'
                              : `${getDocsBaseUrl(config)}/html/userguide/index.html`,
                            '_blank'
                          );
                        }}
                        icon={<ExternalLinkAltIcon />}
                        data-cy="documentation"
                      >
                        {t('Documentation')}
                      </DropdownItem>
                      <DropdownItem onClick={() => openAnsibleAboutModal({})} data-cy="about">
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

function AppBarDropdown(props: { id?: string; icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  const onToggle = useCallback(() => {
    setOpen((open) => !open);
  }, []);
  return (
    <Dropdown
      id={props.id}
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
      ouiaId={props.id}
      data-cy={props.id}
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
  const navigate = useNavigate();
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
          id="account"
          ouiaId="account"
          data-cy="account"
          toggleIndicator={null}
          onToggle={onToggle}
          style={{ paddingRight: 0, paddingLeft: 8 }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
            <FlexItem>
              <UserCircleIcon size="md" />
            </FlexItem>
            {isSmallOrLarger && <FlexItem wrap="nowrap">{activeUser?.username}</FlexItem>}
          </Flex>
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="user-details"
          id="user-details"
          ouiaId="user-details"
          data-cy="user-details"
          onClick={() => {
            isEdaServer()
              ? navigate(activeUser ? RouteObj.EdaMyDetails : RouteObj.EdaUsers)
              : navigate(
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
          id="logout"
          ouiaId="logout"
          data-cy="logout"
          onClick={() => {
            async function logout() {
              isEdaServer()
                ? await postRequest(`${API_PREFIX}/auth/session/logout/`, {})
                : await fetch('/api/logout/');
              navigate('/login');
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
      id="notifications"
      variant={workflowApprovals.length === 0 ? 'read' : 'unread'}
      count={workflowApprovals.length}
      style={{ marginRight: workflowApprovals.length === 0 ? undefined : 12 }}
      // onClick={() => history(RouteObj.WorkflowApprovals)}
      ouiaId="notifications"
      data-cy="notifications"
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
      <Button id="refresh" onClick={refresh} variant="plain" ouiaId="refresh" data-cy="refresh">
        <RedoAltIcon style={{ transform: `rotateZ(${rotation}deg)` }} />
      </Button>
    </Tooltip>
  );
}
