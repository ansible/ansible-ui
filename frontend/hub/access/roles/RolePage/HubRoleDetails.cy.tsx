import mockHubBuiltInRole from '../../../../../cypress/fixtures/hubBuiltInRoleDefinition.json';
import mockHubCustomRole from '../../../../../cypress/fixtures/hubCustomRoleDefinition.json';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { hubAPI } from '../../../common/api/formatPath';
import { HubRoleDetails } from './HubRoleDetails';

describe('HubRoleDetails', () => {
  it('Component renders and displays team details for built in roles', () => {
    cy.intercept(hubAPI`/_ui/v2/role_definitions/1/`, { fixture: 'hubBuiltInRoleDefinition.json' });
    const path = '/roles/:id/details';
    const initialEntries = ['/roles/1/details'];
    const params = {
      path,
      initialEntries,
    };
    cy.mountHub(<HubRoleDetails />, params);
    cy.get('[data-cy="name"]').should('have.text', mockHubBuiltInRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockHubBuiltInRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockHubBuiltInRole.created));
    cy.get('[data-cy="modified"]').should('contain', formatDateString(mockHubBuiltInRole.modified));
    cy.get('[data-cy="galaxy.namespace"]').should('contain', 'Namespace');
    cy.get('[data-cy="permissions"]').should('contain', 'View namespace');
    cy.get('[data-cy="permissions"]').should('contain', 'Change namespace');
    cy.get('[data-cy="permissions"]').should('contain', 'Delete namespace');
  });
  it('Component renders and displays team details for custom roles', () => {
    cy.intercept(hubAPI`/_ui/v2/role_definitions/1/`, { fixture: 'hubCustomRoleDefinition.json' });
    const path = '/roles/:id/details';
    const initialEntries = ['/roles/1/details'];
    const params = {
      path,
      initialEntries,
    };
    cy.mountHub(<HubRoleDetails />, params);
    cy.get('[data-cy="name"]').should('have.text', mockHubCustomRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockHubCustomRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockHubCustomRole.created));
    cy.get('[data-cy="modified"]').should('contain', formatDateString(mockHubCustomRole.modified));
    cy.get('[data-cy="galaxy.ansiblerepository"]').should('contain', 'Ansible Repository');
    cy.get('[data-cy="permissions"]').should('contain', 'View Ansible repository');
  });
});
