import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../../Routes';

export function AccessNav(props: { active: 'organizations' | 'teams' | 'users' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Nav aria-label="TODO" variant="tertiary">
      <NavList>
        <NavItem
          onClick={() => navigate(RouteObj.Organizations)}
          isActive={props.active === 'organizations'}
        >
          {t('Organizations')}
        </NavItem>
        <NavItem onClick={() => navigate(RouteObj.Teams)} isActive={props.active === 'teams'}>
          {t('Teams')}
        </NavItem>
        <NavItem onClick={() => navigate(RouteObj.Users)} isActive={props.active === 'users'}>
          {t('Users')}
        </NavItem>
      </NavList>
    </Nav>
  );
}
