import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import {
  CreateExecutionEnvironment,
  EditExecutionEnvironment,
  IExecutionEnvInput,
} from './ExecutionEnvironmentForm';

describe('Create Edit Execution Environment Form', () => {
  describe('Create Execution Environment', () => {
    it('should validate required fields on save', () => {
      cy.mount(<CreateExecutionEnvironment />);
      cy.clickButton(/^Create execution environment$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Image is required.').should('be.visible');
    });

    it('should create execution environment with only required values passed', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept('POST', '/api/v2/execution_environments/', {
        statusCode: 201,
        fixture: 'execution_environments.json',
      }).as('createEE');
      cy.mount(<CreateExecutionEnvironment />);
      cy.get('[data-cy="name"]').type('Test name');
      cy.get('[data-cy="image"]').type('test/image');
      cy.clickButton(/^Create execution environment$/);
      cy.wait('@createEE')
        .its('request.body')
        .then((createdEE: IExecutionEnvInput) => {
          expect(createdEE).to.deep.equal({
            name: 'Test name',
            image: 'test/image',
          });
        });
    });

    it('should create execution environment with only required values passed', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/credentials/*' },
        { fixture: 'credentials.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/credential_types/*' },
        { fixture: 'credentialTypes.json' }
      );
      cy.intercept('POST', '/api/v2/execution_environments/', {
        statusCode: 201,
        fixture: 'execution_environments.json',
      }).as('createEE');
      cy.mount(<CreateExecutionEnvironment />);
      cy.get('[data-cy="name"]').type('Test name');
      cy.get('[data-cy="image"]').type('test/image');
      cy.selectDropdownOptionByResourceName('pull', 'Always pull container before running');
      cy.get('[data-cy="description"]').type('test');
      cy.get('[data-cy="organization"]').type('Default');
      cy.get('[data-cy="credential-select"]').type('Test Reg Cred');
      cy.clickButton(/^Create execution environment$/);
      cy.wait('@createEE')
        .its('request.body')
        .then((createdEE: IExecutionEnvInput) => {
          expect(createdEE).to.deep.equal({
            name: 'Test name',
            image: 'test/image',
            pull: 'always',
            description: 'test',
            organization: 1,
            credential: 23,
          });
        });
    });
  });

  describe('Edit Execution Environment', () => {
    beforeEach(() => {
      cy.fixture('execution_environment')
        .then((ee: ExecutionEnvironment) => {
          ee.name = 'Test name';
          ee.image = 'test/image';
          ee.pull = 'always';
          ee.description = 'test';
          if (ee.summary_fields.organization?.name) ee.summary_fields.organization.name = 'Default';
          if (ee.summary_fields.credential?.name)
            ee.summary_fields.credential.name = 'Test Reg Cred';
          return ee;
        })
        .then((ee) => {
          cy.intercept(
            { method: 'GET', url: '/api/v2/execution_environments/*/' },
            { body: ee }
          ).as('getEE');
          cy.intercept('PATCH', '/api/v2/execution_environments/*', {
            statusCode: 201,
            body: ee,
          }).as('editEE');
        });

      cy.intercept(
        { method: 'GET', url: '/api/v2/credentials/*' },
        { fixture: 'credentials.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/credential_types/*' },
        { fixture: 'credentialTypes.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditExecutionEnvironment />, {
        path: '/execution-environments/:id/edit',
        initialEntries: [`/execution-environments/2/edit`],
      });
      cy.verifyPageTitle('Edit Execution Environment');
      cy.get('[data-cy="name"]').should('have.value', 'Test name');
    });

    it('Check correct request body is passed after editing ee', () => {
      cy.mount(<EditExecutionEnvironment />, {
        path: '/execution-environments/:id/edit',
        initialEntries: [`/execution-environments/2/edit`],
      });
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Edited EE');
      cy.get('[data-cy="image"]').clear();
      cy.get('[data-cy="image"]').type('edited/image');
      cy.get('.pf-v5-c-select__toggle-clear').click();
      cy.selectDropdownOptionByResourceName('pull', 'Never pull container before running.');
      cy.get('[data-cy="description"]').clear();
      cy.get('[data-cy="description"]').type('Edited desc');
      cy.get('[data-cy="credential-select"]').clear();
      cy.clickButton(/^Save$/);
      cy.wait('@editEE')
        .its('request.body')
        .then((editedEE: IExecutionEnvInput) => {
          expect(editedEE.name).to.equal('Edited EE');
          expect(editedEE.image).to.equal('edited/image');
          expect(editedEE.pull).to.equal('never');
          expect(editedEE.description).to.equal('Edited desc');
          expect(editedEE.credential).to.equal(null);
        });
    });

    it('Validate required fields on save', () => {
      cy.mount(<EditExecutionEnvironment />, {
        path: '/execution-environments/:id/edit',
        initialEntries: [`/execution-environments/2/edit`],
      });
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="image"]').clear();
      cy.clickButton(/^Save$/);
      cy.get(
        '[data-cy="name-form-group"] > .pf-v5-c-form__group-control > .pf-v5-c-form__helper-text > .pf-v5-c-helper-text > .pf-v5-c-helper-text__item'
      ).should('have.text', 'Name is required.');
      cy.get(
        '[data-cy="image-form-group"] > .pf-v5-c-form__group-control > .pf-v5-c-form__helper-text > .pf-v5-c-helper-text > .pf-v5-c-helper-text__item'
      ).should('have.text', 'Image is required.');
    });
  });
});
