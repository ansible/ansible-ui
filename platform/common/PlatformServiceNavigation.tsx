import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useGetPageUrl, usePageNavigate } from '../../framework';

export function PlatformServiceNavigation(props: { awx?: string; eda?: string; hub?: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const location = useLocation();
  return (
    <Nav variant="tertiary" style={{ minHeight: 40, paddingLeft: 8 }}>
      <NavList>
        {props.awx && (
          <NavItem
            isActive={location.pathname.includes(getPageUrl(props.awx))}
            onClick={() => pageNavigate(props.awx!)}
          >
            {t('Automation Execution')}
          </NavItem>
        )}
        {props.eda && (
          <NavItem
            isActive={location.pathname.includes(getPageUrl(props.eda))}
            onClick={() => pageNavigate(props.eda!)}
          >
            {t('Automation Decisions')}
          </NavItem>
        )}
        {props.hub && (
          <NavItem
            isActive={location.pathname.includes(getPageUrl(props.hub))}
            onClick={() => pageNavigate(props.hub!)}
          >
            {t('Automation Content')}
          </NavItem>
        )}
      </NavList>
    </Nav>
  );
}
