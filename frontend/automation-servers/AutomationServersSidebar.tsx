import { Nav, NavItem, NavItemSeparator, NavList, PageSidebar } from '@patternfly/react-core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { useSettings } from '../../framework/Settings'
import { isRouteActive } from '../common/Masthead'
import { RouteE } from '../Routes'

export function AutomationServersSidebar(props: {
  isNavOpen: boolean
  setNavOpen: (open: boolean) => void
}) {
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
          settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
      }}
      nav={
        <>
          <Nav>
            <NavList>
              <NavItemSeparator style={{ margin: 0 }} />
              <NavItem
                isActive={isRouteActive(RouteE.AutomationServers, location)}
                onClick={() => onClick(RouteE.AutomationServers)}
              >
                {t('Automation Servers')}
              </NavItem>
              <NavItemSeparator style={{ margin: 0 }} />
            </NavList>
          </Nav>
        </>
      }
    />
  )
}
