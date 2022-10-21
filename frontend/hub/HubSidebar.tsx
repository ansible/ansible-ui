import {
    Nav,
    NavExpandable,
    NavItem,
    NavItemSeparator,
    NavList,
    PageSidebar,
    Split,
    SplitItem,
} from '@patternfly/react-core'
import { ExternalLinkAltIcon } from '@patternfly/react-icons'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { useSettings } from '../../framework/Settings'
import { AutomationServerSwitcher } from '../common/automation-servers/AutomationServerSwitcher'
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
            style={{
                backgroundColor:
                    settings.theme === 'dark'
                        ? 'var(--pf-global--BackgroundColor--300)'
                        : undefined,
            }}
            nav={
                <>
                    <AutomationServerSwitcher />
                    <Nav>
                        <NavList>
                            <NavItemSeparator style={{ margin: 0 }} />
                            <NavExpandable
                                key="collections"
                                title={t('Collections')}
                                isExpanded
                                isActive={isRouteActive(
                                    [RouteE.Collections, RouteE.Namespaces, RouteE.Repositories],
                                    location
                                )}
                            >
                                <NavItem
                                    isActive={isRouteActive(RouteE.Collections, location)}
                                    onClick={() => onClick(RouteE.Collections)}
                                >
                                    {t('Collections')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.Namespaces, location)}
                                    onClick={() => onClick(RouteE.Namespaces)}
                                >
                                    {t('Namespaces')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.Repositories, location)}
                                    onClick={() => onClick(RouteE.Repositories)}
                                >
                                    {t('Repository management')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.APIToken, location)}
                                    onClick={() => onClick(RouteE.APIToken)}
                                >
                                    {t('API token management')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.Approvals, location)}
                                    onClick={() => onClick(RouteE.Approvals)}
                                >
                                    {t('Collection approvals')}
                                </NavItem>
                            </NavExpandable>
                            <NavExpandable
                                key="execution-environments"
                                title={t('Execution environments')}
                                isExpanded
                                isActive={isRouteActive(
                                    [RouteE.HubExecutionEnvironments, RouteE.RemoteRegistries],
                                    location
                                )}
                            >
                                <NavItem
                                    isActive={isRouteActive(
                                        RouteE.HubExecutionEnvironments,
                                        location
                                    )}
                                    onClick={() => onClick(RouteE.HubExecutionEnvironments)}
                                >
                                    {t('Execution environments')}
                                </NavItem>
                                <NavItem
                                    isActive={isRouteActive(RouteE.RemoteRegistries, location)}
                                    onClick={() => onClick(RouteE.RemoteRegistries)}
                                >
                                    {t('Remote registries')}
                                </NavItem>
                            </NavExpandable>
                            <NavItem
                                isActive={isRouteActive(RouteE.Tasks, location)}
                                onClick={() => onClick(RouteE.Tasks)}
                            >
                                {t('Task management')}
                            </NavItem>
                            <NavItem
                                isActive={isRouteActive(RouteE.SignatureKeys, location)}
                                onClick={() => onClick(RouteE.SignatureKeys)}
                            >
                                {t('Signature keys')}
                            </NavItem>
                            <NavItem
                                onClick={() =>
                                    window.open(
                                        'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
                                        '_blank'
                                    )
                                }
                            >
                                <Split>
                                    <SplitItem isFilled>{t('Documentation')}</SplitItem>
                                    <SplitItem>
                                        <ExternalLinkAltIcon />
                                    </SplitItem>
                                </Split>
                            </NavItem>
                        </NavList>
                    </Nav>
                </>
            }
        />
    )
}
