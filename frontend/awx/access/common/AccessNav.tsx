import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageNavigate } from '../../../../framework';
import { AwxRoute } from '../../AwxRoutes';

export function AccessNav(props: { active: 'organizations' | 'teams' | 'users' }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  return (
    <Nav aria-label="TODO" variant="tertiary">
      <NavList>
        <NavItem
          onClick={() => pageNavigate(AwxRoute.Organizations)}
          isActive={props.active === 'organizations'}
        >
          {t('Organizations')}
        </NavItem>
        <NavItem onClick={() => pageNavigate(AwxRoute.Teams)} isActive={props.active === 'teams'}>
          {t('Teams')}
        </NavItem>
        <NavItem onClick={() => pageNavigate(AwxRoute.Users)} isActive={props.active === 'users'}>
          {t('Users')}
        </NavItem>
      </NavList>
    </Nav>
  );
}
