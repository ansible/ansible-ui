import { PlatformUserTokens } from './PlatformUserTokens';
import * as gatewaySvc from '../../../main/GatewayServices';
import * as activeUserProvider from '../../../main/PlatformActiveUserProvider';

describe('PlatformUserTokens', () => {
  beforeEach(() => {
    cy.stub(activeUserProvider, 'usePlatformActiveUser').callsFake(() => {
      return { activePlatformUser: { id: '20' } };
    });
  });

  it('shows all three token tabs when all services are enabled', () => {
    // this enables all services
    cy.stub(gatewaySvc, 'useGatewayService').callsFake((s: string) => s);

    cy.mount(<PlatformUserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/20/tokens'],
    });
    cy.contains('Ansible Automation Platform');
    cy.contains('Automation Execution');
    cy.contains('Automation Decisions');
  });

  it('shows only AAP token tab when Controller and EDA are disabled', () => {
    // this disables all services
    cy.stub(gatewaySvc, 'useGatewayService').callsFake(() => undefined);

    cy.mount(<PlatformUserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/20/tokens'],
    });
    cy.contains('Ansible Automation Platform');
    cy.contains('Automation Execution').should('not.exist');
    cy.contains('Automation Decisions').should('not.exist');
  });

  it('shows only AAP and Controller token tabs when EDA is disabled', () => {
    // this enables only controller service
    cy.stub(gatewaySvc, 'useGatewayService').callsFake((s: string) =>
      s === 'eda' ? undefined : s
    );

    cy.mount(<PlatformUserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/20/tokens'],
    });
    cy.contains('Ansible Automation Platform');
    cy.contains('Automation Execution');
    cy.contains('Automation Decisions').should('not.exist');
  });
});
