import './styles.css'

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
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NotificationBadge,
    Page,
    PageSidebar,
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
import { BarsIcon, CogIcon, QuestionCircleIcon, RedhatIcon, UserCircleIcon } from '@patternfly/react-icons'
import { Children, ReactNode, StrictMode, Suspense, useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useBreakpoint, useWindowSize } from '../framework'
import ErrorBoundary from '../framework/components/ErrorBoundary'
import { useSettings, useSettingsDialog } from '../framework/Settings'
import { AccessCode } from './common/AccessCode'
// import { useWorkflowApprovals } from './controller/views/WorkflowApprovals'
import { useTranslation } from 'react-i18next'
import { PageFrameworkProvider } from '../framework'
import { useAutomationServers } from './common/useAutomationServer'
import Login from './controller/settings/Login'
import { swrOptions, useFetcher } from './Data'
import { RouteE } from './route'
import { DemoRouter } from './Router'

export default function Demo() {
    const { t } = useTranslation()
    return (
        <StrictMode>
            <ErrorBoundary message={t('An eror occured')}>
                <AccessCode>
                    <PageFrameworkProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path={RouteE.Login} element={<Login />} />
                                <Route path="*" element={<Main />} />\{' '}
                            </Routes>
                        </BrowserRouter>
                    </PageFrameworkProvider>
                </AccessCode>
            </ErrorBoundary>
        </StrictMode>
    )
}

export function Main() {
    const [isNavOpen, setNavOpen] = useState(() => window.innerWidth > 1600)
    return (
        <Page
            header={<DemoHeader isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
            sidebar={<Sidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />}
        >
            <DemoRouter />
        </Page>
    )
}

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
                    <ApplicationLauncherGroup label="Controllers" key="controllers">
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
                    <ApplicationLauncherGroup label="Hubs" key="hubs">
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

function DemoHeader(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
    const isSmallOrLarger = useBreakpoint('sm')
    const { t } = useTranslation()
    const openSettings = useSettingsDialog(t)
    const windowSize = useWindowSize()
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
                                {/* <SparkleSvg style={{ width: 48, height: 48, position: 'absolute' }} /> */}
                                {/* <img src={AnsiblePng} width="192" height="192" style={{ width: 48 }} alt="ansible logo" /> */}
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
                            <Truncate content={t('Ansible Automation Platform')} style={{ minWidth: 0, marginLeft: -8 }} />
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
                            {process.env.NODE_ENV === 'development' && windowSize !== 'xs' && (
                                <ToolbarItem style={{ paddingRight: 8 }}>{windowSize.toUpperCase()}</ToolbarItem>
                            )}
                            <ToolbarItem>
                                <Notifications />
                            </ToolbarItem>

                            <ToolbarItem>
                                <ApplicationLauncherBasic />
                            </ToolbarItem>

                            <ToolbarGroup variant="icon-button-group" visibility={{ default: 'hidden', lg: 'visible' }}>
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
                                    <Button icon={<CogIcon />} variant={ButtonVariant.plain} onClick={openSettings}></Button>
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

function isRouteActive(route: RouteE | RouteE[], location: { pathname: string }) {
    if (Array.isArray(route)) {
        for (const r of route) {
            if (location.pathname.startsWith(r)) return true
        }
        return false
    }
    return location.pathname.includes(route)
}

function Sidebar(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const settings = useSettings()

    const isXl = useBreakpoint('xl')
    const { isNavOpen, setNavOpen } = props
    const onClick = useCallback(
        (route: RouteE) => {
            navigate(route)
            if (!isXl) {
                setNavOpen(false)
            }
        },
        [navigate, isXl, setNavOpen]
    )
    return (
        <PageSidebar
            isNavOpen={isNavOpen}
            style={{ backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--400)' : undefined }}
            nav={
                <Nav>
                    <NavList>
                        {/* <NavExpandable
                            key="controller"
                            title="Controller"
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Dashboard, RouteE.Jobs, RouteE.Schedules, RouteE.ActivityStream, RouteE.WorkflowApprovals],
                                location
                            )}
                        > */}
                        {/* <NavExpandable
                            key="views"
                            title="Views"
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Dashboard, RouteE.Jobs, RouteE.Schedules, RouteE.ActivityStream, RouteE.WorkflowApprovals],
                                location
                            )}
                        >
                            <NavItem isActive={isRouteActive(RouteE.Dashboard, location)}>
                                <Link to={RouteE.Dashboard}>Dashboard</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Jobs, location)}>
                                <Link to={RouteE.Jobs}>Jobs</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Schedules, location)}>
                                <Link to={RouteE.Schedules}>Schedules</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.ActivityStream, location)}>
                                <Link to={RouteE.ActivityStream}>Activity stream</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.WorkflowApprovals, location)}>
                                <Link to={RouteE.WorkflowApprovals}>Workflow approvals</Link>
                            </NavItem>
                        </NavExpandable> */}
                        <NavExpandable
                            key="resources"
                            title={t('Resources')}
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                location
                            )}
                        >
                            {/* <NavItem isActive={isRouteActive(RouteE.Templates, location)}>
                                <Link to={RouteE.Templates}>Templates</Link>
                            </NavItem> */}
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Credentials')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Projects, location)} onClick={() => onClick(RouteE.Projects)}>
                                {t('Projects')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Inventories, location)} onClick={() => onClick(RouteE.Inventories)}>
                                {t('Inventories')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Hosts, location)} onClick={() => onClick(RouteE.Hosts)}>
                                {t('Hosts')}
                            </NavItem>
                        </NavExpandable>
                        <NavExpandable
                            key="access"
                            title={t('Access')}
                            isExpanded
                            isActive={isRouteActive([RouteE.Organizations, RouteE.Users, RouteE.Teams], location)}
                        >
                            <NavItem isActive={isRouteActive(RouteE.Organizations, location)} onClick={() => onClick(RouteE.Organizations)}>
                                {t('Organizations')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Teams, location)} onClick={() => onClick(RouteE.Teams)}>
                                {t('Teams')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Users, location)} onClick={() => onClick(RouteE.Users)}>
                                {t('Users')}
                            </NavItem>
                        </NavExpandable>
                        <NavExpandable
                            key="administration"
                            title="Administration"
                            isExpanded
                            isActive={isRouteActive(
                                [
                                    RouteE.CredentialTypes,
                                    RouteE.Notifications,
                                    RouteE.ManagementJobs,
                                    RouteE.InstanceGroups,
                                    RouteE.Instances,
                                    RouteE.Applications,
                                    RouteE.ExecutionEnvironments,
                                    RouteE.TopologyView,
                                ],
                                location
                            )}
                        >
                            {/* <NavItem isActive={isRouteActive(RouteE.CredentialTypes, location)}>
                                <Link to={RouteE.CredentialTypes}>Credential types</Link>
                            </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Notifications, location)}>
                                <Link to={RouteE.Notifications}>Notifications</Link>
                            </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.ManagementJobs, location)}>
                                <Link to={RouteE.ManagementJobs}>Management jobs</Link>
                            </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.InstanceGroups, location)}>
                                <Link to={RouteE.InstanceGroups}>Instance groups</Link>
                            </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Instances, location)}>
                                <Link to={RouteE.Instances}>Instances</Link>
                            </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Applications, location)}>
                                <Link to={RouteE.Applications}>Applications</Link>
                            </NavItem> */}
                            <NavItem
                                isActive={isRouteActive(RouteE.ExecutionEnvironments, location)}
                                onClick={() => onClick(RouteE.ExecutionEnvironments)}
                            >
                                {t('Execution Environments')}
                            </NavItem>
                            {/* <NavItem isActive={isRouteActive(RouteE.TopologyView, location)}>
                                <Link to={RouteE.TopologyView}>Topology view</Link>
                            </NavItem> */}
                        </NavExpandable>
                        {/* <NavGroup>
                            <NavItem isActive={isRouteActive(RouteE.Settings, location)}>
                                <Link to={RouteE.Settings}>Settings</Link>
                            </NavItem>
                        </NavGroup> */}
                        {/* </NavExpandable> */}
                    </NavList>
                </Nav>
            }
        />
    )
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
    const meResponse = useSWR<{ results: { username: string }[] }>('/api/v2/me/', fetcher, swrOptions)
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
                <DropdownToggle toggleIndicator={null} onToggle={onToggle} style={{ paddingRight: 0, paddingLeft: 8 }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
                        <FlexItem>
                            <UserCircleIcon size="md" />
                        </FlexItem>
                        {isSmallOrLarger && <FlexItem wrap="nowrap">{meResponse.data?.results?.[0]?.username}</FlexItem>}
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
                            history(RouteE.Login)
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
