import * as useOptions from '../../../../common/crud/useOptions';
import * as useAwxConfig from '../../../common/useAwxConfig';
import { CreateProject, EditProject } from './ProjectForm';
import { Project } from '../../../interfaces/Project';

describe('ProjectForm.cy.ts', () => {
  beforeEach(() => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          GET: {
            scm_type: {
              type: 'choice',
              label: 'SCM Type',
              help_text: 'Specifies the source control system used to store the project.',
              filterable: true,
              choices: [
                ['', 'Manual'],
                ['git', 'Git'],
                ['svn', 'Subversion'],
                ['insights', 'Red Hat Insights'],
                ['archive', 'Remote Archive'],
              ],
            },
          },
        },
      },
    }));
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => null);
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      { fixture: 'organizations.json' }
    );
    cy.intercept({ method: 'GET', url: '/api/v2/credentials/*' }, { fixture: 'credentials.json' });
  });

  describe('validates fields', () => {
    it('validates initial required fields', () => {
      cy.mount(<CreateProject />);
      cy.clickButton(/^Create project$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Organization is required.').should('be.visible');
      cy.contains('Source control type is required.').should('be.visible');
      cy.verifyPageTitle('Create project');
    });

    it('validates required field for source control types', () => {
      cy.mount(<CreateProject />);
      cy.get('[data-cy="name"]').type('Test Project');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');

      // Git
      cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');

      // Insights
      cy.selectDropdownOptionByResourceName('source_control_type', 'Red Hat Insights');
      cy.clickButton(/^Create project$/);
      cy.contains('Insights credential is required.').should('be.visible');

      // Remote Archive
      cy.selectDropdownOptionByResourceName('source_control_type', 'Remote Archive');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');

      // SVN
      cy.selectDropdownOptionByResourceName('source_control_type', 'Subversion');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');
    });
  });

  it('displays warning if there are no available playbook directories (Manual source control type)', () => {
    cy.mount(<CreateProject />);
    cy.get('[data-cy="name"]').type('Test Project');
    cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Manual');
    cy.contains('WARNING:').should('be.visible');
    cy.contains('There are no available playbook directories').should('be.visible');
  });

  it('should pass correct request body after editing project credentials ', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'project.json' }).as(
      'getProject'
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/1/' },
      { fixture: 'organization.json' }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        query: {
          credential_type__namespace: 'gpg_public_key',
        },
      },
      {
        body: {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 123,
              kind: 'gpg_public_key',
              cloud: false,
              kubernetes: false,
              name: 'gpg credential',
            },
          ],
        },
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        query: {
          credential_type__namespace: 'scm',
        },
      },
      {
        body: {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 456,
              kind: 'scm',
              cloud: false,
              kubernetes: false,
              name: 'scm credential',
            },
          ],
        },
      }
    );
    cy.intercept('PATCH', 'api/v2/projects/*', { statusCode: 201 }).as('editProject');
    cy.mount(<EditProject />);
    cy.verifyPageTitle('Edit Demo Project @ 10:44:51');
    cy.getByDataCy('name').should('have.value', 'Demo Project @ 10:44:51');
    cy.getByDataCy('organization').should('have.text', 'Default');
    cy.getByDataCy('signature_validation_credential').should('have.text', 'Select credential');
    cy.getByDataCy('credential').should('have.text', 'Select credential');
    cy.getByDataCy('scm-url').should(
      'have.value',
      'https://github.com/ansible/ansible-tower-samples'
    );
    cy.selectSingleSelectOption('[data-cy="signature_validation_credential"]', 'gpg credential');
    cy.selectSingleSelectOption('[data-cy="credential"]', 'scm credential');
    cy.getByDataCy('signature_validation_credential').should('have.text', 'gpg credential');
    cy.getByDataCy('credential').should('have.text', 'scm credential');

    cy.clickButton(/^Save project$/);
    cy.wait('@editProject')
      .its('request.body')
      .then((project: Project) => {
        expect(project.signature_validation_credential).equal(123);
        expect(project.credential).equal(456);
      });
  });
});
