import { gatewayAPI, gatewayV1API } from '../../../api/gateway-api-utils';
import * as usePlatformActiveUser from '../../../main/PlatformActiveUserProvider';
import { CreatePlatformTeam, EditPlatformTeam } from './PlatformTeamForm';
import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import mockPlatformUsers from '../../../../cypress/fixtures/platformUsers.json';

const mockActivePlatformUser = mockPlatformUsers.results[0];
const mockPlatformTeam = mockPlatformTeams.results[0];

describe('PlatformTeamForm.cy.ts', () => {
  describe('Create team', () => {
    it('Validation on name and organization', () => {
      cy.intercept(
        { method: 'GET', url: gatewayAPI`/organizations/*` },
        {
          count: 2,
          results: [
            { id: 0, name: 'Default' },
            { id: 1, name: 'Organization 1' },
          ],
        }
      );
      cy.mount(<CreatePlatformTeam />);
      cy.clickButton(/^Create team$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Organization is required.').should('be.visible');
    });
  });

  describe('Edit Team', () => {
    const component = <EditPlatformTeam />;
    const path = '/access/teams/:id/edit';
    const initialEntries = [`/access/teams/5/edit`];
    const params = {
      path,
      initialEntries,
    };
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/`,
        },
        mockPlatformTeam
      );
      cy.intercept(
        { method: 'GET', url: gatewayV1API`/organizations/*` },
        {
          count: 2,
          results: [
            { id: 0, name: 'Default' },
            { id: 1, name: 'Organization 1' },
          ],
        }
      );
    });
    it('Organization is not editable for normal users', () => {
      cy.stub(usePlatformActiveUser, 'usePlatformActiveUser').callsFake(() => ({
        activePlatformUser: { ...mockActivePlatformUser, is_superuser: false },
      }));
      cy.mount(component, params);
      cy.get('button[data-cy="organization"]').as('organizationSelect');
      cy.get('@organizationSelect').should('have.attr', 'disabled');
      cy.get('@organizationSelect').click({ force: true });
      cy.get('@organizationSelect').hasTooltip(
        /^You do not have permission to edit the organization. Please contact your system administrator if there is an issue with your access.$/
      );
    });
    it('Organization is editable for super users', () => {
      cy.stub(usePlatformActiveUser, 'usePlatformActiveUser').callsFake(() => ({
        activePlatformUser: { ...mockActivePlatformUser },
      }));
      cy.mount(component, params);
      cy.get('button[data-cy="organization"]').as('organizationSelect');
      cy.get('@organizationSelect').should('not.have.attr', 'disabled');
    });
  });
});
