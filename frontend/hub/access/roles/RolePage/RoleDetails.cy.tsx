import { Role } from '../Role';
import { RoleDetails } from './RoleDetails';
import { pulpAPI } from '../../../common/api/formatPath';
import mockUser from '../../../../../cypress/fixtures/hub_admin.json';
import * as useHubContext from '../../../common/useHubContext';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

const mockRole: Role = {
  name: 'galaxy.mockRole',
  description: 'mock role description',
  permissions: ['galaxy.upload_to_namespace', 'galaxy.add_user'],
  pulp_href: '/api/galaxy/pulp/api/v3/roles/53759f26-ca33-4619-8fe7-8ebb2ca37996/',
  pulp_created: '2023-12-06T17:07:47.687445Z',
  locked: false,
};

const mockFeatureFlags = {
  legacy_roles: false,
  display_repositories: true,
  execution_environments: true,
  ai_deny_index: false,
  collection_signing: true,
  require_upload_signatures: false,
  signatures_enabled: true,
  can_upload_signatures: false,
  can_create_signatures: true,
  collection_auto_sign: true,
  display_signatures: true,
  container_signing: true,
  _messages: [],
};

describe('Hub Role Details', () => {
  it('Component renders and displays role', () => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      featureFlags: mockFeatureFlags,
    }));
    cy.intercept(
      { method: 'GET', url: pulpAPI`/roles/` + '*' },
      {
        count: 1,
        results: [mockRole],
      }
    );
    cy.mount(<RoleDetails />);
    cy.get('#name').should('have.text', mockRole.name);
    cy.get('#description').should('have.text', mockRole.description);
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockRole.pulp_created));
    cy.get('[data-cy="permissions"]').should('contain', 'Upload to namespace');
    cy.get('[data-cy="permissions"]').should('contain', 'Add user');
  });
});
