import { Nav, NavExpandable, NavItem, NavList, PageSidebar } from '@patternfly/react-core'
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
                <Nav>
                    <NavList>
                        <NavExpandable
                            key="resources"
                            title={t('Resources')}
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                location
                            )}
                        >
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Collections')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Namespaces')}
                            </NavItem> */}
                            <NavItem isActive={isRouteActive(RouteE.Repositories, location)} onClick={() => onClick(RouteE.Repositories)}>
                                {t('Repositories')}
                            </NavItem>
                            {/* <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('API Tokens')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Approvals')}
                            </NavItem> */}
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
                        </NavExpandable>
                        <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                            {t('Task management')}
                        </NavItem>
                        <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                            {t('Signature keys')}
                        </NavItem>
                        <NavExpandable
                            key="user-access"
                            title={t('User access')}
                            isExpanded
                            isActive={isRouteActive(
                                [RouteE.Templates, RouteE.Credentials, RouteE.Projects, RouteE.Inventories, RouteE.Hosts],
                                location
                            )}
                        >
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Users')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Groups')}
                            </NavItem>
                            <NavItem isActive={isRouteActive(RouteE.Credentials, location)} onClick={() => onClick(RouteE.Credentials)}>
                                {t('Roles')}
                            </NavItem>
                        </NavExpandable> */}
                    </NavList>
                </Nav>
            }
        />
    )
}
