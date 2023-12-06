import { pulpAPI } from '../../../api/formatPath';
import { Role } from '../Role';
import { CreateRole, EditRole } from './RoleForm';
import mockUser from '../../../../../cypress/fixtures/hub_admin.json';
import * as useHubContext from '../../../useHubContext';

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
const mockRole: Role = {
  name: 'galaxy.mockRole',
  description: 'mock role description',
  permissions: ['galaxy.upload_to_namespace', 'galaxy.add_user'],
  pulp_href: '/api/automation-hub/pulp/api/v3/roles/53759f26-ca33-4619-8fe7-8ebb2ca37996/',
  pulp_created: '2023-12-06T17:07:47.687445Z',
  locked: false,
};

describe('Hub Roles Form', () => {
  beforeEach(() => {
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      user: mockUser,
      featureFlags: mockFeatureFlags,
    }));
  });
  it('should validate required fields on save', () => {
    cy.mount(<CreateRole />);
    cy.clickButton(/^Create role$/);
    cy.contains('Name is required.').should('be.visible');
    cy.contains('Description is required.').should('be.visible');
  });

  it('should validate that the name and description are longer than 2 characters', () => {
    cy.mount(<CreateRole />);
    cy.get('[data-cy="name"]').type('xy');
    cy.get('[data-cy="description"]').type('xy');
    cy.clickButton(/^Create role$/);
    cy.contains('Name must be longer than 2 characters.').should('be.visible');
    cy.contains('Description must be longer than 2 characters.').should('be.visible');
  });

  it('should validate that the name starts with "galaxy."', () => {
    cy.mount(<CreateRole />);
    cy.get('[data-cy="name"]').type('demorole');
    cy.get('[data-cy="description"]').type('mock description');
    cy.clickButton(/^Create role$/);
    cy.contains("Name must start with 'galaxy.'.").should('be.visible');
  });

  it('name field should be read-only in edit mode', () => {
    cy.intercept({ method: 'GET', url: pulpAPI`/roles/*` }, mockRole);
    cy.mount(<EditRole />);
    cy.get('[data-cy="name"]').should('have.attr', 'readonly');
  });

  it('should preload the form with current values', () => {
    cy.intercept({ method: 'GET', url: pulpAPI`/roles/*` }, mockRole);
    cy.mount(<EditRole />);
    cy.verifyPageTitle('Edit Role');
    cy.get('[data-cy="name"]').should('have.value', mockRole.name);
    cy.get('[data-cy="description"]').should('have.value', mockRole.description);
    cy.get('[data-cy="permissioncategories-0-selectedpermissions-form-group"]').should(
      'contain',
      'Upload to namespace'
    );
    cy.get('[data-cy="permissioncategories-2-selectedpermissions-form-group"]').should(
      'contain',
      'Add user'
    );
  });
  //   let inputsContent = '';
  //   beforeEach(() => {
  //     cy.intercept(
  //       { method: 'GET', url: '/api/v2/credential_types/*' },
  //       {
  //         statusCode: 200,
  //         body: credentialType,
  //       }
  //     );
  //     cy.fixture('inputs.yaml').then((yaml: string) => {
  //       inputsContent = yaml;
  //     });
  //   });

  //   it('should preload the form with current values', () => {
  //     cy.mount(<EditCredentialType />);
  //     cy.verifyPageTitle('Edit Credential Type');
  //     cy.get('[data-cy="name"]').should('have.value', 'Mock Credential Type');
  //     cy.get('[data-cy="description"]').should('have.value', 'mock credential type description');
  //     cy.get('[data-cy="inputs"]').find('textarea').should('have.value', inputsContent);
  //     cy.get('[data-cy="injectors"]').find('textarea').should('have.value', '---\n');
  //   });

  //   it('should edit credential type', () => {
  //     cy.intercept('PATCH', '/api/v2/credential_types/*', {
  //       statusCode: 201,
  //       body: credentialType,
  //     }).as('editCredentialType');
  //     cy.mount(<EditCredentialType />);
  //     cy.get('[data-cy="name"]').should('have.value', 'Mock Credential Type');
  //     cy.get('[data-cy="name"]').clear();
  //     cy.get('[data-cy="name"]').type('Edited Credential Type');
  //     cy.clickButton(/^Save credential type$/);
  //     cy.wait('@editCredentialType')
  //       .its('request.body')
  //       .then((editedCredentialType: CredentialTypeForm) => {
  //         expect(editedCredentialType.name).to.equal('Edited Credential Type');
  //         expect(editedCredentialType.description).to.equal('mock credential type description');
  //         expect(editedCredentialType.inputs).to.deep.equal({
  //           fields: [
  //             {
  //               id: 'username',
  //               type: 'string',
  //               label: 'Username',
  //             },
  //           ],
  //           required: ['username'],
  //         });
  //         expect(editedCredentialType.injectors).to.deep.equal({});
  //       });
  //   });
  // });
});
