/* eslint-disable i18next/no-literal-string */
import { Divider, Nav, NavItem, NavList } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../framework';
import { AwxRoles } from './AwxRoles';
import { EdaRoles } from './EdaRoles';

export function PlatformRoles() {
  const { t } = useTranslation();
  const [active, setActive] = useState<'awx' | 'eda' | 'hub'>('eda');
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents set of actions that a group or user may perform on a resource or set of resources.'
        )}
        navigation={
          <div style={{ paddingLeft: 8 }}>
            <Nav variant="tertiary">
              <NavList>
                <NavItem isActive={active === 'awx'} onClick={() => setActive('awx')}>
                  {t('Automation Execution')}
                </NavItem>
                <NavItem isActive={active === 'eda'} onClick={() => setActive('eda')}>
                  {t('Automation Decision')}
                </NavItem>
                <NavItem isActive={active === 'hub'} onClick={() => setActive('hub')}>
                  {t('Automation Content')}
                </NavItem>
              </NavList>
            </Nav>
          </div>
        }
      />

      <Divider />
      {active === 'awx' && <AwxRoles />}
      {active === 'eda' && <EdaRoles />}
      {/* {active === 'hub' && <HubRoles />} */}
    </PageLayout>
  );
}
