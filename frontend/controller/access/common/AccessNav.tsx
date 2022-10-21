import { Nav, NavItem, NavList } from '@patternfly/react-core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RouteE } from '../../../Routes'

export function AccessNav(props: { active: 'organizations' | 'teams' | 'users' }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    return (
        <Nav aria-label="TODO" variant="tertiary">
            <NavList>
                <NavItem
                    onClick={() => navigate(RouteE.Organizations)}
                    isActive={props.active === 'organizations'}
                >
                    {t('Organizations')}
                </NavItem>
                <NavItem onClick={() => navigate(RouteE.Teams)} isActive={props.active === 'teams'}>
                    {t('Teams')}
                </NavItem>
                <NavItem onClick={() => navigate(RouteE.Users)} isActive={props.active === 'users'}>
                    {t('Users')}
                </NavItem>
            </NavList>
        </Nav>
    )
}
