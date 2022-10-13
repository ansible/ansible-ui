import { Nav, NavExpandable, NavItem, NavItemSeparator, NavList, PageSection, PageSidebar, Text, Title } from '@patternfly/react-core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { useSettings } from '../../framework/Settings'
import { isRouteActive } from '../common/Masthead'
import { RouteE } from '../Routes'

export function HubSidebar(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
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
            style={{ backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined }}
            nav={
                <>
                    <Nav>
                        <NavList>
                            <NavItemSeparator style={{ margin: 0 }} />
                        </NavList>
                    </Nav>
                    <PageSection
                        variant="dark"
                        style={{
                            backgroundColor:
                                settings.theme === 'light'
                                    ? 'var(--pf-global--BackgroundColor--100)'
                                    : 'var(--pf-global--BackgroundColor--400)',
                        }}
                    >
                        <Title headingLevel="h2">{t('Server Name (TODO)')}</Title>
                        <Text component="small" style={{ opacity: 0.7 }}>
                            {t('Automation Hub')}
                        </Text>
                    </PageSection>
                    <Nav>
                        <NavList>
                            <NavItemSeparator style={{ margin: 0 }} />
                            <NavExpandable
                                key="resources"
                                title={t('Resources')}
                                isExpanded
                                isActive={isRouteActive(
                                    [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                    location
                                )}
                            >
                                <NavItem isActive={isRouteActive(RouteE.Collections, location)} onClick={() => onClick(RouteE.Collections)}>
                                    {t('Collections')}
                                </NavItem>
                                <NavItem isActive={isRouteActive(RouteE.Namespaces, location)} onClick={() => onClick(RouteE.Namespaces)}>
                                    {t('Namespaces')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.Repositories, location)}
                                    onClick={() => onClick(RouteE.Repositories)}
                                >
                                    {t('Repositories')}
                                </NavItem>
                                <NavItem isActive={isRouteActive(RouteE.Approvals, location)} onClick={() => onClick(RouteE.Approvals)}>
                                    {t('Collection approvals')}
                                </NavItem>
                            </NavExpandable>
                            {/* <NavExpandable
                                key="execution-environments"
                                title={t('Execution environments')}
                                isExpanded
                                isActive={isRouteActive(
                                    [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                    location
                                )}
                            >
                                <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                    {t('Execution environments')}
                                </NavItem>
                                <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                    {t('Remote registries')}
                                </NavItem>
                            </NavExpandable> */}
                            <NavItem isActive={isRouteActive(RouteE.Tasks, location)} onClick={() => onClick(RouteE.Tasks)}>
                                {t('Task management')}
                            </NavItem>
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Signature keys')}
                            </NavItem> */}
                            {/* <NavExpandable
                                key="access"
                                title={t('Access')}
                                isExpanded
                                isActive={isRouteActive(
                                    [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                    location
                                )}
                            > */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                    {t('Users')}
                                </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                    {t('Groups')}
                                </NavItem> */}
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                    {t('Roles')}
                                </NavItem> */}
                            {/* </NavExpandable> */}
                        </NavList>
                    </Nav>
                </>
            }
        />
    )
}
