import * as useOptions from '../../../../common/crud/useOptions';
import * as useAwxConfig from '../../../common/useAwxConfig';
import { CreateProject, EditProject } from './ProjectForm';

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
    cy.intercept(
      { method: 'GET', url: '/api/v2/credential_types/*' },
      { fixture: 'credential_types.json' }
    );
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'project.json' });
  });
  describe('validates fields', () => {
    it('validates initial required fields', () => {
      cy.mount(<CreateProject />);
      cy.clickButton(/^Create project$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Organization is required.').should('be.visible');
      cy.contains('Source control type is required.').should('be.visible');
      cy.verifyPageTitle('Create Project');
    });
    it('validates required field for source control types', () => {
      cy.mount(<CreateProject />);
      cy.get('[data-cy="project-name"]').type('Test Project');
      cy.selectDropdownOptionByResourceName('organization', 'Default');
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
    it('validates content signature validation credential', () => {
      cy.intercept(
        { method: 'GET', url: 'api/v2/credentials/?name=*' },
        {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }
      );
      cy.mount(<EditProject />, { path: '/:id/*', initialEntries: ['/9'] });
      cy.get('#credential-select').type('XYZ');
      cy.clickButton(/^Save project$/);
      cy.contains('Credential not found.').should('be.visible');
      cy.verifyPageTitle('Edit Project');
    });
    it('validates source control credential', () => {
      cy.intercept(
        { method: 'GET', url: 'api/v2/credentials/?name=*' },
        {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }
      );
      cy.mount(<EditProject />, { path: '/:id/*', initialEntries: ['/9'] });
      // Incorrect credential
      cy.get('#credential-select').type('XYZ');
      cy.clickButton(/^Save project$/);
      cy.contains('Credential not found.').should('be.visible');
      cy.verifyPageTitle('Edit Project');
    });
  });
  it('displays warning if there are no available playbook directories (Manual source control type)', () => {
    cy.mount(<CreateProject />);
    cy.get('[data-cy="project-name"]').type('Test Project');
    cy.selectDropdownOptionByResourceName('organization', 'Default');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Manual');
    cy.contains('WARNING:').should('be.visible');
    cy.contains('There are no available playbook directories').should('be.visible');
  });
});
