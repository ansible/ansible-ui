import './styles.css'

import {
    ApplicationLauncher,
    ApplicationLauncherItem,
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
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
    Truncate,
} from '@patternfly/react-core'
import { BarsIcon, QuestionCircleIcon, UserCircleIcon } from '@patternfly/react-icons'
import { Children, ReactNode, Suspense, useCallback, useState } from 'react'
import { BrowserRouter, Link, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import useSWR from 'swr'
import { useWindowSizeOrLarger, WindowSize } from '../framework'
import { AccessCode } from './common/AccessCode'
import Login from './controller/settings/Login'
import { useWorkflowApprovals } from './controller/views/WorkflowApprovals'
import { useFetcher } from './Data'
import AnsiblePng from './icons/ansible.png'
import SparkleSvg from './icons/sparkle.svg'
import { RouteE } from './route'
import { DemoRouter } from './Router'

export default function Demo() {
    return (
        <AccessCode>
            <BrowserRouter>
                <Switch>
                    <Route exact path={RouteE.Login} component={Login} />
                    <Route path="*">
                        <Main />
                    </Route>
                </Switch>
            </BrowserRouter>
        </AccessCode>
    )
}

export function Main() {
    return (
        <Page header={<DemoHeader />} sidebar={<Sidebar />} isManagedSidebar defaultManagedSidebarIsOpen={false}>
            <DemoRouter />
        </Page>
    )
}

export const ApplicationLauncherBasic: React.FunctionComponent = () => {
    const [isOpen, setIsOpen] = useState(false)
    const onToggle = (isOpen: boolean) => setIsOpen(isOpen)
    const onSelect = () => setIsOpen((prevIsOpen) => !prevIsOpen)
    return (
        <ApplicationLauncher
            onSelect={onSelect}
            onToggle={onToggle}
            isOpen={isOpen}
            items={[
                <ApplicationLauncherItem key="application_1a" href="#">
                    Application 1
                </ApplicationLauncherItem>,
                <ApplicationLauncherItem key="application_2a" component="button" onClick={() => alert('Clicked item 2')}>
                    Application 2
                </ApplicationLauncherItem>,
            ]}
        />
    )
}

function DemoHeader() {
    const isSmallOrLarger = useWindowSizeOrLarger(WindowSize.sm)
    return (
        <Masthead display={{ default: 'inline' }}>
            <MastheadToggle>
                <PageToggleButton variant="plain" aria-label="Global navigation">
                    <BarsIcon />
                </PageToggleButton>
            </MastheadToggle>
            {isSmallOrLarger ? (
                <MastheadMain>
                    <MastheadBrand>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ marginTop: 6 }}>
                                <SparkleSvg style={{ width: 48, height: 48, position: 'absolute' }} />
                                <img src={AnsiblePng} width="192" height="192" style={{ width: 48 }} alt="ansible logo" />
                            </div>
                            <div style={{ color: 'white', textDecoration: 'none' }}>
                                <Title headingLevel="h4" style={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                    Red Hat
                                </Title>
                                <Title headingLevel="h3" style={{ fontWeight: 'lighter', lineHeight: 1.2 }}>
                                    <Truncate content="Ansible Automation Platform" style={{ minWidth: 0 }} />
                                </Title>
                            </div>
                        </div>
                    </MastheadBrand>
                </MastheadMain>
            ) : (
                <MastheadMain style={{ marginRight: 0, minHeight: isSmallOrLarger ? undefined : 0 }}>
                    <MastheadBrand>
                        <Title headingLevel="h3" style={{ color: 'white' }}>
                            <Truncate content="Ansible Automation Platform" style={{ minWidth: 0, marginLeft: -8 }} />
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
                            <ToolbarItem>
                                <Notifications />
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
                                    <AppBarDropdown icon={<QuestionCircleIcon />}>
                                        <DropdownItem
                                            onClick={() => {
                                                open(
                                                    'https://docs.ansible.com/automation-controller/4.2.0/html/userguide/index.html',
                                                    '_blank'
                                                )
                                            }}
                                        >
                                            Help
                                        </DropdownItem>
                                        <DropdownItem>About</DropdownItem>
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
function Sidebar() {
    const location = useLocation()
    return (
        <PageSidebar
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
                        <NavExpandable
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
                            {/* <NavItem isActive={isRouteActive(RouteE.Jobs, location)}>
                                <Link to={RouteE.Jobs}>Jobs</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Schedules, location)}>
                                <Link to={RouteE.Schedules}>Schedules</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.ActivityStream, location)}>
                                <Link to={RouteE.ActivityStream}>Activity stream</Link>
                            </NavItem> */}
                            <NavItem isActive={isRouteActive(RouteE.WorkflowApprovals, location)}>
                                <Link to={RouteE.WorkflowApprovals}>Workflow approvals</Link>
                            </NavItem>
                        </NavExpandable>
                        {/* <NavExpandable
                            key="resources"
                            title="Resources"
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                location
                            )}
                        >
                            <NavItem isActive={isRouteActive(RouteE.Templates, location)}>
                                <Link to={RouteE.Templates}>Templates</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)}>
                                <Link to={RouteE.Credentials}>Credentials</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Projects, location)}>
                                <Link to={RouteE.Projects}>Projects</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Inventories, location)}>
                                <Link to={RouteE.Inventories}>Inventories</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Hosts, location)}>
                                <Link to={RouteE.Hosts}>Hosts</Link>
                            </NavItem>
                        </NavExpandable> */}
                        <NavExpandable
                            key="access"
                            title="Access"
                            isExpanded
                            isActive={isRouteActive([RouteE.Organizations, RouteE.Users, RouteE.Teams], location)}
                        >
                            <NavItem isActive={isRouteActive(RouteE.Organizations, location)}>
                                <Link to={RouteE.Organizations}>Organizations</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Teams, location)}>
                                <Link to={RouteE.Teams}>Teams</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Users, location)}>
                                <Link to={RouteE.Users}>Users</Link>
                            </NavItem>
                        </NavExpandable>
                        {/* <NavExpandable
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
                            <NavItem isActive={isRouteActive(RouteE.CredentialTypes, location)}>
                                <Link to={RouteE.CredentialTypes}>Credential types</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Notifications, location)}>
                                <Link to={RouteE.Notifications}>Notifications</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.ManagementJobs, location)}>
                                <Link to={RouteE.ManagementJobs}>Management jobs</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.InstanceGroups, location)}>
                                <Link to={RouteE.InstanceGroups}>Instance groups</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Instances, location)}>
                                <Link to={RouteE.Instances}>Instances</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Applications, location)}>
                                <Link to={RouteE.Applications}>Applications</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.ExecutionEnvironments, location)}>
                                <Link to={RouteE.ExecutionEnvironments}>Execution environments</Link>
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.TopologyView, location)}>
                                <Link to={RouteE.TopologyView}>Topology view</Link>
                            </NavItem>
                        </NavExpandable> */}
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
    const isSmallOrLarger = useWindowSizeOrLarger(WindowSize.sm)
    const fetcher = useFetcher()
    const meResponse = useSWR<{ results: { username: string }[] }>('/api/v2/me/', fetcher, { suspense: true })
    const history = useHistory()
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
                        history.push(RouteE.Users)
                    }}
                >
                    User Details
                </DropdownItem>,
                <DropdownItem
                    key="logout"
                    onClick={() => {
                        async function logout() {
                            await fetch('/api/logout')
                            history.push(RouteE.Login)
                        }
                        void logout()
                    }}
                >
                    Logout
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
    const workflowApprovals = useWorkflowApprovals()
    const history = useHistory()
    return (
        <NotificationBadge
            variant={workflowApprovals.length === 0 ? 'read' : 'unread'}
            count={workflowApprovals.length}
            style={{ marginRight: workflowApprovals.length === 0 ? undefined : 12 }}
            onClick={() => history.push(RouteE.WorkflowApprovals)}
        />
    )
}
