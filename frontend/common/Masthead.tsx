import {
  ApplicationLauncher,
  ApplicationLauncherGroup,
  ApplicationLauncherItem,
  ApplicationLauncherSeparator,
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
  Stack,
  StackItem,
  Text,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Truncate,
} from '@patternfly/react-core'
import {
  BarsIcon,
  CogIcon,
  QuestionCircleIcon,
  RedhatIcon,
  UserCircleIcon,
} from '@patternfly/react-icons'
import { Children, ReactNode, Suspense, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useBreakpoint } from '../../framework'
import { useSettingsDialog } from '../../framework/Settings'
import { useAutomationServers } from '../automation-servers/AutomationServerProvider'
import { swrOptions, useFetcher } from '../Data'
import { RouteE } from '../Routes'

export const ApplicationLauncherBasic: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = (isOpen: boolean) => setIsOpen(isOpen)
  const navigate = useNavigate()

  const { automationServers } = useAutomationServers()
  const controllers = automationServers.filter((server) => server.type === 'controller')
  const hubs = automationServers.filter((server) => server.type === 'hub')
  return (
    <ApplicationLauncher
      onToggle={onToggle}
      isOpen={isOpen}
      items={[
        controllers.length && (
          <ApplicationLauncherGroup label="Automation Controllers" key="controllers">
            {controllers.map((server) => (
              <ApplicationLauncherItem
                key={server.name}
                onClick={() => navigate(RouteE.Login + '?server=' + encodeURIComponent(server.url))}
              >
                <Stack>
                  {server.name}
                  <StackItem>
                    <Text component="small" style={{ opacity: 0.7 }}>
                      {server.url}
                    </Text>
                  </StackItem>
                </Stack>
              </ApplicationLauncherItem>
            ))}
          </ApplicationLauncherGroup>
        ),
        hubs.length && <ApplicationLauncherSeparator key="1" />,
        hubs.length && (
          <ApplicationLauncherGroup label="Automation Hubs" key="hubs">
            {hubs.map((server) => (
              <ApplicationLauncherItem
                key={server.name}
                onClick={() => navigate(RouteE.Login + '?server=' + encodeURIComponent(server.url))}
              >
                <Stack>
                  {server.name}
                  <StackItem>
                    <Text component="small" style={{ opacity: 0.7 }}>
                      {server.url}
                    </Text>
                  </StackItem>
                </Stack>
              </ApplicationLauncherItem>
            ))}
          </ApplicationLauncherGroup>
        ),
        // <ApplicationLauncherSeparator key="2" />,
        // <ApplicationLauncherItem key="add controller" icon={<PlusIcon />}>
        //     Add Controller
        // </ApplicationLauncherItem>,
        // <ApplicationLauncherItem key="add hub" icon={<PlusIcon />}>
        //     Add Hub
        // </ApplicationLauncherItem>,
      ].filter(Boolean)}
      position="right"
    />
  )
}

export function AnsibleMasthead(props: {
  isNavOpen: boolean
  setNavOpen: (open: boolean) => void
}) {
  const isSmallOrLarger = useBreakpoint('sm')
  const { t } = useTranslation()
  const openSettings = useSettingsDialog(t)
  return (
    <Masthead display={{ default: 'inline' }}>
      <MastheadToggle onClick={() => props.setNavOpen(!props.isNavOpen)}>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      {isSmallOrLarger ? (
        <MastheadMain>
          <MastheadBrand>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ marginTop: 6 }}>
                <RedhatIcon size="lg" color="#ee0000" style={{ marginTop: -20 }} />
              </div>
              <div style={{ color: 'white', textDecoration: 'none' }}>
                <Title headingLevel="h4" style={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {t('Red Hat')}
                </Title>
                <Title headingLevel="h3" style={{ fontWeight: 'lighter', lineHeight: 1.2 }}>
                  <Truncate content={t('Ansible Automation Platform')} style={{ minWidth: 0 }} />
                </Title>
              </div>
            </div>
          </MastheadBrand>
        </MastheadMain>
      ) : (
        <MastheadMain style={{ marginRight: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
          <MastheadBrand>
            <Title headingLevel="h3" style={{ color: 'white' }}>
              <Truncate
                content={t('Ansible Automation Platform')}
                style={{ minWidth: 0, marginLeft: -8 }}
              />
            </Title>
          </MastheadBrand>
        </MastheadMain>
      )}
      <MastheadContent style={{ marginLeft: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
        <span style={{ flexGrow: 1 }} />
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

              <ToolbarItem>
                <ApplicationLauncherBasic />
              </ToolbarItem>

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
                  ></Button>
                </ToolbarItem>
                <ToolbarItem>
                  <AppBarDropdown icon={<QuestionCircleIcon />}>
                    <DropdownItem
                      onClick={() => {
                        open(
                          'https://docs.ansible.com/automation-controller/4.2.0/html/userguide/index.html',
                          '_blank'
                        )
                      }}
                    >
                      {t('Help')}
                    </DropdownItem>
                    <DropdownItem>{t('About')}</DropdownItem>
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
  )
}

export function isRouteActive(route: RouteE | RouteE[], location: { pathname: string }) {
  if (Array.isArray(route)) {
    for (const r of route) {
      if (location.pathname.startsWith(r)) return true
    }
    return false
  }
  return location.pathname.includes(route)
}

function AppBarDropdown(props: { icon: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const onSelect = useCallback(() => {
    setOpen((open) => !open)
  }, [])
  const onToggle = useCallback(() => {
    setOpen((open) => !open)
  }, [])
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
  )
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
  )
}

function AccountDropdownInternal() {
  const isSmallOrLarger = useBreakpoint('sm')
  const fetcher = useFetcher()
  const { automationServer } = useAutomationServers()
  const meResponse = useSWR<{ results: { username: string }[] }>(
    automationServer ? '/api/v2/me/' : undefined,
    fetcher,
    swrOptions
  )
  const history = useNavigate()
  const [open, setOpen] = useState(false)
  const onSelect = useCallback(() => {
    setOpen((open) => !open)
  }, [])
  const onToggle = useCallback(() => {
    setOpen((open) => !open)
  }, [])
  const { t } = useTranslation()
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
            history(RouteE.Users)
          }}
        >
          {t('User details')}
        </DropdownItem>,
        <DropdownItem
          key="logout"
          onClick={() => {
            async function logout() {
              await fetch('/api/logout')
              history(RouteE.AutomationServers)
            }
            void logout()
          }}
        >
          {t('Logout')}
        </DropdownItem>,
      ]}
      position="right"
      // style={{ marginTop: 4 }}
    />
  )
}

function Notifications() {
  return (
    <Suspense fallback={<></>}>
      <NotificationsInternal />
    </Suspense>
  )
}

function NotificationsInternal() {
  // const workflowApprovals = useWorkflowApprovals()
  const workflowApprovals = []
  // const history = useNavigate()
  return (
    <NotificationBadge
      variant={workflowApprovals.length === 0 ? 'read' : 'unread'}
      count={workflowApprovals.length}
      style={{ marginRight: workflowApprovals.length === 0 ? undefined : 12 }}
      // onClick={() => history(RouteE.WorkflowApprovals)}
    />
  )
}
