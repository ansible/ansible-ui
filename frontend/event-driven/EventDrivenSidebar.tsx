import {
  Nav,
  NavExpandable,
  NavItem,
  NavItemSeparator,
  NavList,
  PageSidebar,
} from '@patternfly/react-core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { useSettings } from '../../framework/Settings'
import { AutomationServerSwitcher } from '../automation-servers/AutomationServerSwitcher'
import { isRouteActive } from '../common/Masthead'
import { RouteE } from '../Routes'

export function EventDrivenSidebar(props: {
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
        <Nav>
          <NavList>
            <NavItemSeparator style={{ margin: 0 }} />
            <AutomationServerSwitcher />
            <NavItemSeparator style={{ margin: 0 }} />
            <NavExpandable
              key="resources"
              title={t('Resources')}
              isExpanded
              isActive={isRouteActive([RouteE.EDAProjects], location)}
            >
              <NavItem
                isActive={isRouteActive(RouteE.EDAProjects, location)}
                onClick={() => onClick(RouteE.EDAProjects)}
              >
                {t('Projects')}
              </NavItem>
            </NavExpandable>
          </NavList>
        </Nav>
      }
    />
  )
}
