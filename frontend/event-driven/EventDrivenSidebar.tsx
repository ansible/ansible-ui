import { NavItem } from '@patternfly/react-core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { CommonSidebar } from '../common/CommonSidebar'
import { isRouteActive } from '../common/Masthead'
import { RouteE } from '../Routes'

export function EventDrivenSidebar(props: {
  isNavOpen: boolean
  setNavOpen: (open: boolean) => void
}) {
  const { isNavOpen, setNavOpen } = props
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isXl = useBreakpoint('xl')
  const onClick = useCallback(
    (route: RouteE) => {
      navigate(route)
      if (!isXl) setNavOpen(false)
    },
    [navigate, isXl, setNavOpen]
  )
  return (
    <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen}>
      <NavItem
        isActive={isRouteActive(RouteE.EDAProjects, location)}
        onClick={() => onClick(RouteE.EDAProjects)}
      >
        {t('Projects')}
      </NavItem>
    </CommonSidebar>
  )
}
