import { PlatformTeamUsers } from './PlatformTeamUsers';
import * as GatewayServices from '../../../main/GatewayServices';

describe('PlatformTeamUsers', () => {
  it('Displays all tabs when all services are enabled', () => {
    cy.stub(GatewayServices, 'useGatewayService').callsFake((serviceType) => {
      if (serviceType === 'controller') {
        return '/api/controller/';
      } else if (serviceType === 'hub') {
        return '/api/hub/';
      }
      return undefined;
    });
    cy.mount(<PlatformTeamUsers />);
    cy.get('.pf-v5-c-tabs__item').should('have.length', 3);
    cy.containsBy('button', /^Ansible Automation Platform$/);
    cy.containsBy('button', /^Automation Execution$/);
    cy.containsBy('button', /^Automation Content$/);
  });
  it('Hides Automation Execution and Automation Content tabs when services are not enabled', () => {
    cy.mount(<PlatformTeamUsers />);
    cy.get('.pf-v5-c-tabs__item').should('have.length', 1);
    cy.containsBy('button', /^Ansible Automation Platform$/);
    cy.contains('button', /^Automation Execution$/).should('not.exist');
    cy.contains('button', /^Automation Content$/).should('not.exist');
  });
});
