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
import styled from 'styled-components';
import {
  useBreakpoint,
  usePageNavSideBar,
  usePageNavigate,
  useSettingsDialog,
} from '../../framework';
import { AwxRoute } from '../awx/AwxRoutes';
import { useAwxConfig } from '../awx/common/useAwxConfig';
import getDocsBaseUrl from '../awx/common/util/getDocsBaseUrl';
import { EdaRoute } from '../eda/EdaRoutes';
import { API_PREFIX } from '../eda/constants';
import { useAnsibleAboutModal } from './AboutModal';
import { PageRefreshIcon } from './PageRefreshIcon';
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

export function AnsibleMasthead() {
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
      <MastheadToggle onClick={() => navBar.setState({ isOpen: !navBar.isOpen })}>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
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
                <PageRefreshIcon />
              </ToolbarItem>

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
                  <Button icon={<CogIcon />} variant={ButtonVariant.plain} onClick={openSettings} />
                </ToolbarItem>
                <ToolbarItem>
                  <AppBarDropdown icon={<QuestionCircleIcon />}>
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

export function AppBarDropdown(props: { icon: ReactNode; children: ReactNode }) {
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

export function AccountDropdown() {
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
  const pageNavigate = usePageNavigate();
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
            {isSmallOrLarger && <FlexItem wrap="nowrap">{activeUser?.username}</FlexItem>}
          </Flex>
        </DropdownToggle>
      }
      isOpen={open}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="user-details"
          onClick={() => {
            isEdaServer()
              ? activeUser
                ? pageNavigate(EdaRoute.MyPage)
                : pageNavigate(EdaRoute.Users)
              : activeUser
              ? pageNavigate(AwxRoute.UserPage, { params: { id: activeUser.id } })
              : pageNavigate(AwxRoute.Users);
          }}
        >
          {t('User details')}
        </DropdownItem>,
        <DropdownItem
          key="logout"
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
