import { PlatformOrganizationUsers } from './PlatformOrganizationUsers';
import * as GatewayServices from '../../../main/GatewayServices';

describe('PlatformOrganizationUsers', () => {
  it('Displays Ansible Automation Platform and Automation Execution tabs when Controller service is enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      }
      return undefined;
    });
    cy.mount(<PlatformOrganizationUsers />);
    cy.get('.pf-v5-c-tabs__item').should('have.length', 2);
    cy.containsBy('button', /^Ansible Automation Platform$/);
    cy.containsBy('button', /^Automation Execution$/);
  });
  it('Hides Automation Execution tab when Controller service is not enabled', () => {
    cy.mount(<PlatformOrganizationUsers />);
    cy.get('.pf-v5-c-tabs__item').should('have.length', 1);
    cy.containsBy('button', /^Ansible Automation Platform$/);
    cy.contains('button', /^Automation Execution$/).should('not.exist');
  });
});
